import { NextRequest, NextResponse } from 'next/server';
import { getWorkshopUrl } from '@/lib/steam-community-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string }> }
) {
  try {
    const { appid } = await params;
    const appIdNum = parseInt(appid, 10);

    if (isNaN(appIdNum)) {
      return NextResponse.json(
        { error: 'Invalid app ID' },
        { status: 400 }
      );
    }

    // Workshop items cannot be fetched via public API
    // Return the workshop URL instead
    const workshopUrl = getWorkshopUrl(appIdNum);

    return NextResponse.json({
      message: 'Workshop items require authentication and cannot be fetched via public API',
      workshopUrl,
      appId: appIdNum,
    });
  } catch (error) {
    console.error('Error in workshop API:', error);
    return NextResponse.json(
      { error: 'Failed to process workshop request' },
      { status: 500 }
    );
  }
}
