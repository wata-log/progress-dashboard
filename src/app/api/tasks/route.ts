import { NextResponse } from 'next/server';

const GAS_URL = process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycbzj45YPoHSh7dwqL2x4oFEidQyJC3PQna3u0ILVugsjbnzy0VQIbdc4sI4P-tIPjZuf_w/exec';

export async function GET() {
  try {
    const response = await fetch(GAS_URL, { cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // GAS側へリクエストを転送
    const response = await fetch(GAS_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid response from GAS', details: text }, { status: 500 });
    }
  } catch (error) {
    console.error('API POST Error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
