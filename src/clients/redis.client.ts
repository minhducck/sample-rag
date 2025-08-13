import "reflect-metadata";
import {injectable} from "inversify";
import {createClient} from "redis";
import {RedisClientOptions} from "@redis/client";

@injectable()
export class RedisClient {
  private readonly redisClient;

  constructor(options: RedisClientOptions) {
    this.redisClient = createClient(options);
    this.redisClient.on('error', (err) => {
      console.log(`Redis Client Error on "${options?.name}"`, err)
    });
  }

  async connect() {
    await this.redisClient.connect();
    return this;
  }

  async disconnect() {
    await this.redisClient.destroy();
    return this;
  }

  getRedisHandler = () => this.redisClient

  async incr(key: string = "key") {
    // @ts-ignore
    return this.getRedisHandler().incr(key);
  }

  async decr(key: string = "key") {
    // @ts-ignore
    return this.getRedisHandler().decr(key)
  }

  async hmset(key: string = "key", values = []) {
    // @ts-ignore
    return this.getRedisHandler().hmset(key, values);
  }

  async exists(key: string = "key") {
    // @ts-ignore
    return this.getRedisHandler().exists(key)
  }

  async hexists(key: string = "key", key2 = "") {
    // @ts-ignore
    return this.getRedisHandler().hexists(key, key2)
  }

  async set(key: string = "key", value: string) {
    // @ts-ignore
    return this.getRedisHandler().set(key, value)
  }

  async get(key: string = "key") {
    // @ts-ignore
    return this.getRedisHandler().get(key)
  }

  async hgetall(key: string = "key") {
    // @ts-ignore
    return this.getRedisHandler().hgetall(key)
  }

  async zrangebyscore(key: string = "key", min = 0, max = 1) {
    // @ts-ignore
    this.getRedisHandler().zrangebyscore(key, min, max);
  }

  async zadd(key: string = "key", key2 = "", value: string) {
    //@ts-ignore
    return this.getRedisHandler().zadd(key, key2, value)
  }

  async sadd(key: string = "key", value: string) {
    //@ts-ignore
    return this.getRedisHandler().sadd(key, value)
  }

  async hmget(key: string = "key", key2 = "") {
    //@ts-ignore
    return this.getRedisHandler().hmget(key, key2)
  }

  async sismember(key: string = "key", key2 = "") {
    //@ts-ignore
    return this.getRedisHandler().sismember(key, key2)
  }

  async smembers(key: string = "key") {
    //@ts-ignore
    return this.getRedisHandler().smembers(key)
  }

  async srem(key: string = "key", key2 = "") {
    //@ts-ignore
    return this.getRedisHandler().srem(key, key2)
  }

  async sendCommand(args: string[]) {
    return this.getRedisHandler().sendCommand(args);
  }
}
