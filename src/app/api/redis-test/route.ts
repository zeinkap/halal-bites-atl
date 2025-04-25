import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function GET() {
  try {
    // Test write operation
    await redis.set('test-key', 'Hello from Halal Bites ATL!', { ex: 60 });
    
    // Test read operation
    const value = await redis.get('test-key');
    
    // Test delete operation
    await redis.del('test-key');
    
    return NextResponse.json({
      success: true,
      message: 'Redis connection test successful',
      testValue: value,
    });
  } catch (error) {
    console.error('Redis test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Redis test failed' 
      },
      { status: 500 }
    );
  }
} 