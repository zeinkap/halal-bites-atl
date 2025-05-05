import 'dotenv/config';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

async function clearCache() {
  try {
    const key = 'restaurants:all';
    await redis.del(key);
    console.log(`Successfully cleared Redis cache for key: ${key}`);
    process.exit(0);
  } catch (error) {
    console.error('Error clearing Redis cache:', error);
    process.exit(1);
  }
}

clearCache(); 