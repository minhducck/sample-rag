import {inject, injectable} from "inversify";
import {LMSClient} from "@/clients/lms-client";
import {FaissStore} from "@langchain/community/vectorstores/faiss";
import {Document} from "@langchain/core/documents";
import {LocalEmbeddingProvider} from "@/ulti/local-embedding";
import {APPLICATION_CONFIGURATION} from "@/configuration/application.config";
import * as path from "node:path";
import * as process from "node:process";
import * as fs from "node:fs";

import Parser from 'rss-parser';
import {YcomEntry} from "@apps/ycombinator/types/ycom-entry.type";
import {CheerioWebBaseLoader} from "@langchain/community/document_loaders/web/cheerio";
import {merge} from "lodash";


@injectable()
export class Ycombinator {
  private storage: FaissStore = null
  private rssParser: Parser = null;
  private webLoader: CheerioWebBaseLoader = null;

  constructor(
    @inject(LMSClient) public readonly client: LMSClient,
    @inject('LocalEmbeddingProvider') public readonly embeddingProvider: LocalEmbeddingProvider,
  ) {
    this.rssParser = new Parser();
  }

  private getParser(): Parser {
    if (this.rssParser === null) {
      this.rssParser = new Parser();
    }
    return this.rssParser;
  }

  private getPersistencePath() {
    return path.resolve(
      process.cwd(),
      APPLICATION_CONFIGURATION['FAISS_DATA']
    )
  }

  async getRecentRssFeed(): Promise<YcomEntry[]> {
    const data = await this.getParser().parseURL('https://news.ycombinator.com/rss') as { items: YcomEntry[] };
    return data.items;
  }

  async loadCommentChunksFromPost(entry: YcomEntry) {
    const pageLoader = new CheerioWebBaseLoader(entry.comments, {
      selector: 'div.commtext',
      maxConcurrency: 5,
      maxRetries: 3
    });
    const chunks = await pageLoader.load();

    chunks.forEach((chunk) => {
      chunk.metadata = chunk.metadata || {};
      chunk.metadata = merge(chunk.metadata, entry, {topics: ["YCombinator", "Hacker News", "The Hacker News"]});
    });

    return chunks;
  }

  async saveToStore(docs: Document[]) {
    const storage = await this.getStorage();
    return storage.addDocuments(docs).finally(() => this.flushToDisk())
  }

  async flushToDisk() {
    return this.getStorage().then(storage => storage.save(this.getPersistencePath()))
  }

  async findSimilar(query: string, k: number) {
    const storage = await this.getStorage();
    return storage.asRetriever(k).invoke(query);
  }

  private async getStorage() {
    if (this.storage === null) {
      if (fs.existsSync(this.getPersistencePath())) {
        this.storage = await FaissStore.load(
          this.getPersistencePath(),
          await this.embeddingProvider(
            {maxRetries: 3, maxConcurrency: 10, onFailedAttempt: console.error},
            'text-embedding-nomic-embed-text-v1.5'
          ),
        );
      } else {
        this.storage = new FaissStore(
          await this.embeddingProvider(
            {maxRetries: 3, maxConcurrency: 10, onFailedAttempt: console.error},
            'text-embedding-nomic-embed-text-v1.5'
          ),
          {}
        );
      }
    }

    return this.storage;
  }
}