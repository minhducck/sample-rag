import "reflect-metadata";
import {injectable} from "inversify";
import {RedisClient} from "../../clients/redis.client";
import {APPLICATION_CONFIGURATION} from "@/configuration/application.config";
import {PubsubHandlerType} from "./types/pubsub-handler.type";
import {RedisClientType, RedisDefaultModules, RedisFunctions, RedisModules, RedisScripts} from "redis";

export const DEFAULT_PUB_SUB_HANDLER = 'default';

@injectable()
export class PubSubManager {
  private pubHandlers: PubsubHandlerType = {}
  private subHandlers: PubsubHandlerType = {}
  private redisClient?: RedisClient;

  private getClient = () => {
    if (this.redisClient === undefined) {
      this.redisClient = new RedisClient({
        url: APPLICATION_CONFIGURATION['REDIS_SERVER'],
        password: APPLICATION_CONFIGURATION['REDIS_PASSWORD'],
        database: +APPLICATION_CONFIGURATION['REDIS_DATABASE'],
        name: "PubSubManager"
      });
    }
    return this.redisClient;
  }

  public getPublisher(channel: string = DEFAULT_PUB_SUB_HANDLER) {
    if (this.pubHandlers[channel] === undefined) {
      throw new Error(`The publisher "${channel}" was not registered. Please make sure publisher has been registered before using it.`)
    }
    return this.pubHandlers[channel];
  }

  public getSubscriber(channel: string = DEFAULT_PUB_SUB_HANDLER) {
    if (this.subHandlers[channel] === undefined) {
      throw new Error(`The subscriber "${channel}" was not registered. Please make sure publisher has been registered before using it.`)
    }
    return this.subHandlers[channel];
  }

  async registerSubscriber(channel: string): Promise<RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>> {
    if (this.subHandlers[channel]) {
      throw new Error(`The subscriber "${channel}" has already registered.`)
    }

    const client = this.getClient().getRedisHandler().duplicate();
    await client.connect();
    this.subHandlers[channel] = client;

    return client;
  }


  async registerPublisher(channel: string): Promise<RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>> {
    if (this.pubHandlers[channel]) {
      throw new Error(`The subscriber "${channel}" has already registered.`)
    }

    const client = this.getClient().getRedisHandler().duplicate();
    await client.connect();
    this.pubHandlers[channel] = client;

    return client;
  }

  action = async () => {
    await this.getClient().connect();

    await this.getClient().incr("Duc");
    console.log(await this.getClient().decr("Duc"))

    await this.getClient().disconnect();
  }

  async destroy() {
    for (const channel in Object.keys(this.pubHandlers)) {
      this.pubHandlers[channel]?.disconnect();
    }

    for (const channel in Object.keys(this.subHandlers)) {
      this.subHandlers[channel]?.disconnect();
    }
  }
}
