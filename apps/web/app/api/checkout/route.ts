import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Setup Prisma 7 client with the Driver Adapter for safety
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: true });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const { email, packId } = await request.json();

    if (!email || !packId) {
      return NextResponse.json({ error: "Missing email or packId" }, { status: 400 });
    }

    // 1. Fetch the Past Question Pack from the database to get the real price
    const pack = await prisma.pastQuestionPack.findUnique({
      where: { id: packId },
    });

    if (!pack || !pack.isActive) {
      return NextResponse.json({ error: "Past Question pack not found" }, { status: 404 });
    }

    // 2. Prepare Paystack payload (Paystack processes amounts in kobo: ₦2,000 = 200000 kobo)
    const paystackAmount = pack.price * 100; 
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json({ error: "Paystack config missing on server" }, { status: 500 });
    }

    // 3. Initialize transaction with Paystack API
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: paystackAmount,
        metadata: {
          packId: pack.id,
        },
        // Paystack will redirect back to this page when payment completes
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-success`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message || "Paystack initialization failed" }, { status: 400 });
    }

    // 4. Return authorization URL so the frontend can redirect the student to pay
    return NextResponse.json({ authorization_url: data.data.authorization_url });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}