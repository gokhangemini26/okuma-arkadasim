import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
        console.log(`Proxying request to: ${targetUrl}`);

        // Fetch from Pollinations AI server-side (Node.js environment)
        // This replicates the successful behavior of our test-url.js script
        const response = await fetch(targetUrl, {
            method: 'GET',
            // We intentionally do NOT set complex headers to mimic a clean request
        });

        if (!response.ok) {
            console.error(`Upstream error: ${response.status} ${response.statusText}`);
            return new NextResponse(`Upstream error: ${response.status}`, { status: response.status });
        }

        const blob = await response.blob();
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
        headers.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

        return new NextResponse(blob, { headers });

    } catch (error) {
        console.error('Proxy internal error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
