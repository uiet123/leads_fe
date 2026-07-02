import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const source = searchParams.get('source');
  const limitNeighborhoods = searchParams.get('limitNeighborhoods') === 'true';

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const leadsBePath = path.resolve(process.cwd(), '../leads_be');
  const env = { ...process.env, LIMIT_NEIGHBORHOODS: limitNeighborhoods ? 'true' : 'false' };
  
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      console.log(`Starting live scrape for: "${query}" (Source: ${source || 'maps'}) in ${leadsBePath}...`);
      
      const args = ['src/index.js', query];
      if (source === 'instagram') {
        args.push('--instagram');
      }

      const child = spawn('node', args, {
        cwd: leadsBePath,
        env: env
      });

      child.stdout.on('data', (data) => {
        const text = data.toString();
        // Server-Sent Events format requires lines starting with "data: "
        const lines = text.split('\n').filter(Boolean);
        for (const line of lines) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'log', message: line })}\n\n`));
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        const lines = text.split('\n').filter(Boolean);
        for (const line of lines) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: line })}\n\n`));
        }
      });

      child.on('close', (code) => {
        console.log(`Scraper exited with code ${code}`);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', code })}\n\n`));
        controller.close();
      });

      child.on('error', (err) => {
        console.error('Failed to start subprocess.', err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`));
        controller.close();
      });

      // Handle request abort
      request.signal.addEventListener('abort', () => {
        console.log('Client aborted connection, killing scraper...');
        child.kill();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
