// import Redis from "ioredis"
// import dotenv from "dotenv"
// dotenv.config();
// export const client = new Redis(process.env.REDIS_URL);

import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redis = null;

function initRedis() {
    if (process.env.REDIS_URL && !redis) {
        try {
            redis = new Redis(process.env.REDIS_URL, {
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
                tls: {},
            });
            redis.on('connect', () => console.log('✅ Redis connected'));
            redis.on('error', (err) => console.log('⚠️ Redis error:', err.message));
            return redis;
        } catch (err) {
            console.log('⚠️ Redis init error:', err.message);
            return null;
        }
    }
    return redis;
}

function getRedis() {
    return redis || initRedis();
}

export { initRedis, getRedis };