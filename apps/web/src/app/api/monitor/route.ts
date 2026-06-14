import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Configuration for FUNAI portal pages to monitor
const PAGES_TO_MONITOR = [
  { key: 'PUTME_RESULTS', url: 'https://portal.funai.edu.ng/Pages/Applications/PUTME/CheckScreeningResult.aspx' },
  { key: 'SUPPLEMENTARY', url: 'https://portal.funai.edu.ng/Pages/Applications/PUTME_SUPP/ScreeningForm.aspx' }
];

export async function GET(request: Request) {
  // Security: Ensure only the Vercel Cron service can trigger this
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    for (const page of PAGES_TO_MONITOR) {
      // 1. Fetch the raw HTML
      const response = await fetch(page.url, { next: { revalidate: 0 } });
      const html = await response.text();

      // 2. Normalize: Strip dynamic timestamps/tokens to avoid false positives
      const sanitized = html.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
      const currentHash = crypto.createHash('sha256').update(sanitized).digest('hex');

      // 3. Check against database
      const existing = await prisma.portalState.findUnique({ where: { pageKey: page.key } });

      if (!existing || existing.lastHash !== currentHash) {
        // 4. Update state and log the change
        await prisma.portalState.upsert({
          where: { pageKey: page.key },
          update: { lastHash: currentHash },
          create: { pageKey: page.key, lastHash: currentHash }
        });

        // 5. Trigger Web Push (Logic to be implemented in step 6)
        console.log(`Change detected on ${page.key}! Triggering notification system...`);
      }
    }

    return NextResponse.json({ success: true, message: 'Scan complete' });
  } catch (error) {
    console.error('Monitoring failed:', error);
    return NextResponse.json({ error: 'Monitoring failed' }, { status: 500 });
  }
}