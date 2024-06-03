import NodeCache from 'node-cache';

const CACHE_EXPIRY = 5 * 60;
const cache = new NodeCache({ stdTTL: CACHE_EXPIRY, checkperiod: 360 });

export const isCacheStale = (now: number, lastUpdatedAt: number) => {
    return (now - Number(lastUpdatedAt) > CACHE_EXPIRY * 1000);
}

export default cache;