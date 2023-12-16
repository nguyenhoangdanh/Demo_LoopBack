import Redis from 'ioredis';

export class RedisHelper {
  client: Redis;

  constructor(options: {
    name: string;
    host: string;
    port: number;
    password: string;
    onConnected?: (opts: { name: string; helper: RedisHelper }) => void;
    onReady?: (opts: { name: string; helper: RedisHelper }) => void;
    onError?: (opts: { name: string; helper: RedisHelper; error: any }) => void;
  }) {
    const { name, host, port, password, onConnected, onReady, onError } =
      options;
    this.client = new Redis({
      name,
      host,
      port,
      password,
      retryStrategy: (times: number) => {
        return Math.max(Math.min(Math.exp(times), 20000), 1000);
      },
      maxRetriesPerRequest: null,
    });

    this.client.on('connect', () => {
      onConnected?.({ name, helper: this });
    });

    this.client.on('ready', () => {
      onReady?.({ name, helper: this });
    });

    this.client.on('error', error => {
      onError?.({ name, helper: this, error });
    });

    this.client.on('reconnecting', () => {});
  }

  async set(opts: { key: string; value: any; options?: { log: boolean } }) {
    const { key, value, options = { log: false } } = opts;

    if (!this.client) {
      return;
    }

    const serialized = JSON.stringify(value);
    await this.client.set(key, serialized);

    if (!options?.log) {
      return;
    }
  }

  async get(opts: { key: string; transform?: (input: string) => any }) {
    const { key, transform } = opts;
    if (!this.client) {
      return null;
    }

    const value = await this.client.get(key);
    if (!transform || !value) {
      return value;
    }

    return transform(value);
  }

  async getString(opts: { key: string }) {
    const rs = await this.get(opts);
    return rs;
  }

  async mget(keys: string[]) {
    const values = await this.client.mget(...keys);
    return values;
  }

  async getObject(opts: { key: string }) {
    const rs = await this.get({
      ...opts,
      transform: (cached: string) => JSON.parse(cached),
    });

    return rs;
  }

  async keys(opts: { key: string }) {
    const { key } = opts;
    if (!this.client) {
      return [];
    }

    const existedKeys = await this.client.keys(key);
    return existedKeys;
  }
}
