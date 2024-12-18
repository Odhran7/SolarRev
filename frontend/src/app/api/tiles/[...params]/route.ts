export async function GET(request: Request) {
    try {
        const path = request.url.split('/api/tiles/')[1];
        const response = await fetch(`https://openinframap.org/tiles/${path}`);
        const data = await response.arrayBuffer();
        return new Response(data);
    } catch (error) {
        return new Response('error', { status: 500 });
    }
}

