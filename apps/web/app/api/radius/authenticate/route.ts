import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Secure network token signature check to authorize inbound requests from the university's central RADIUS gateway
    const systemToken = req.headers.get('x-funai-ict-signature');
    if (systemToken !== process.env.ICT_GATEWAY_SHARED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized network entry context rejected.' }, { status: 401 });
    }

    const body = await req.json();
    const { macAddress, callingSsid, assignedIp } = body;

    if (!macAddress) {
      return NextResponse.json({ error: 'Missing hardware tracking configuration data.' }, { status: 400 });
    }

    // Hash parameter clean string resolution processing step
    const normalizedMac = macAddress.toUpperCase().replace(/[^0-9A-F]/g, '');
    const macHash = createHash('sha256').update(normalizedMac).digest('hex');

    // Query active state validation checks
    const targetDeviceProfile = await prisma.registeredDevice.findUnique({
      where: { macAddressHash: macHash },
      include: { student: true }
    });

    if (!targetDeviceProfile || !targetDeviceProfile.isActive || targetDeviceProfile.trustLevel === 'BLOCKED') {
      return NextResponse.json({
        action: 'REJECT',
        reason: 'Device verification parameters missing or banned.',
        fallbackSessionTimeout: 28800 // Default to 8-hour access window for standard unlinked users
      });
    }

    const sessionWindowHours = callingSsid === 'AE-FUNAI-FREE-GUEST' ? 8 : 72;

    // Track historical connectivity telemetry within operational schemas
    await prisma.wifiSession.create({
      data: {
        deviceId: targetDeviceProfile.id,
        studentId: targetDeviceProfile.studentId,
        ssid: callingSsid || 'AE-FUNAI-CAMPUS-MAIN',
        ipAddress: assignedIp || '0.0.0.0',
        trustLevelUsed: targetDeviceProfile.trustLevel,
        expiresAt: new Date(new Date().getTime() + sessionWindowHours * 60 * 60 * 1000)
      }
    });

    return NextResponse.json({
      action: 'ACCEPT',
      sessionTimeoutSeconds: sessionWindowHours * 60 * 60,
      userContext: targetDeviceProfile.student.full_name,
      clearanceLevel: targetDeviceProfile.trustLevel
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal pipeline validation malfunction error.' }, { status: 500 });
  }
}