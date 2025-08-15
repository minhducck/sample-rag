import {inject, injectable} from "inversify";
import {LMSClient} from "@/clients/lms-client";
import {Document} from "@langchain/core/documents";
import Parser from 'rss-parser';
import {YcomEntry} from "@apps/ycombinator/types/ycom-entry.type";
import {CheerioWebBaseLoader} from "@langchain/community/document_loaders/web/cheerio";
import {merge} from "lodash";
import moment from "moment";
import {FaissStoreService} from "@/storages/faiss-store.service";


@injectable()
export class Ycombinator {
  private rssParser: Parser = null;

  constructor(
    @inject(LMSClient) public readonly client: LMSClient,
    @inject(FaissStoreService) public readonly persistence: FaissStoreService,
  ) {
    this.rssParser = new Parser();
  }

  private getParser(): Parser {
    if (this.rssParser === null) {
      this.rssParser = new Parser();
    }
    return this.rssParser;
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
      chunk.metadata = merge(chunk.metadata, entry, {
        topics: ["YCombinator", "Hacker News", "The Hacker News", moment().format('YYYY-MM-DD')]
      });
    });

    return chunks;
  }

  async saveToStore(docs: Document[]) {
    return this.persistence.addDocuments(docs);
  }
}