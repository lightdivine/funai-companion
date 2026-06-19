import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { Resend } from 'resend';

// 1. Setup Prisma 7 native database pool connection
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: true });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const paystackSignature = req.headers.get('x-paystack-signature');

    if (!paystackSignature) {
      return new NextResponse('Missing signature header context.', { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return new NextResponse('Internal environment variable execution locked.', { status: 500 });
    }

    // Fixed: Paystack signatures use HMAC SHA512, not SHA256
    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody, 'utf8')
      .digest('hex');

    if (hash !== paystackSignature) {
      return new NextResponse('Cryptographic signature check mismatch.', { status: 400 });
    }

    const eventData = JSON.parse(rawBody);

    if (eventData.event !== 'charge.success') {
      return NextResponse.json({ received: true });
    }

    // Extract transaction details safely
    const email = eventData.data.customer.email;
    const reference = eventData.data.reference;
    const amountKobo = eventData.data.amount; 
    const packId = eventData.data.metadata?.packId;

    if (!packId) {
      return new NextResponse('Metadata descriptor vector processing payload error.', { status: 400 });
    }

    const downloadToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // Strict 48-Hour allocation boundary

    // Record the completed purchase into Neon using standard Naira currency units
    await prisma.purchase.create({
      data: {
        email,
        packId,
        reference,
        amountPaid: amountKobo / 100, // Fixed: Converts kobo back to normal Naira
        downloadToken,
        expiresAt,
        downloadCount: 0,
      },
    });

    // Keep this clean lookup ready for any future file counts or attachments
    const packFiles = await prisma.packFile.findMany({
      where: { packId },
      orderBy: { sortOrder: 'asc' },
    });

    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/download/${downloadToken}`;

    // Execute your original Resend HTML email template sequence
    await resend.emails.send({
      from: 'Academics Hub <delivery@yourapp.com>',
      to: [email],
      subject: 'Your Past Questions are Ready 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1b5e20; margin-top: 0;">Transaction Verified Successfully!</h2>
          <p style="font-size: 14px; color: #374151; line-height: 1.5;">Thank you for your purchase. Your access voucher token parameters have been mapped instantly to our asset nodes.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${downloadUrl}" style="background-color: #1b5e20; color: white; padding: 12px 24px; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 8px; display: inline-block;">Access Downloads Dashboard</a>
          </div>
          <p style="font-size: 11px; color: #9ca3af; line-height: 1.4; border-top: 1px solid #f3f4f6; padding-top: 12px; margin-bottom: 0;">
            ⚠️ <strong>Notice:</strong> This secure download link will systematically expire in 48 hours. Max threshold download count: 5 attempts. Need assistance? Message our core WhatsApp lines instantly.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook fault intercept payload failure:', error);
    return new NextResponse('Internal execution block failure exception.', { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}