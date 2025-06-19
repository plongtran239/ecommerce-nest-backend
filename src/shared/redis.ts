import Client from 'ioredis';

import Redlock from 'redlock';
import envConfig from 'src/shared/config';

const redis = new Client({
  host: envConfig.REDIS_URL,
});

export const redlock = new Redlock([redis], {
  retryCount: 3,
  retryDelay: 200, // time in ms
});
