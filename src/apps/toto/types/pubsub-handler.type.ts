import {RedisClientType, RedisDefaultModules, RedisFunctions, RedisModules, RedisScripts} from "redis";

export interface PubsubHandlerType extends Record<string, RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>>{}
