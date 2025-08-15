import fs from "node:fs";
import {inject, injectable} from "inversify";
import {LocalEmbeddingProvider} from "@/ulti/local-embedding";
import path from "node:path";
import process from "node:process";
import {APPLICATION_CONFIGURATION} from "@/configuration/application.config";
import {FaissStore} from "@langchain/community/vectorstores/faiss";
import {Document} from "@langchain/core/documents";

@injectable('Singleton')
export class FaissStoreService {
  private storage: FaissStore = null

  constructor(@inject('LocalEmbeddingProvider') public readonly embeddingProvider: LocalEmbeddingProvider) {
  }

  private getPersistencePath() {
    return path.resolve(
      process.cwd(),
      APPLICATION_CONFIGURATION['FAISS_DATA']
    )
  }


  private async getStorage() {
    if (this.storage === null) {
      if (fs.existsSync(this.getPersistencePath())) {
        this.storage = await FaissStore.load(
          this.getPersistencePath(),
          await this.embeddingProvider(
            {maxRetries: 3, maxConcurrency: 10, onFailedAttempt: console.error},
            APPLICATION_CONFIGURATION['EMBEDDING_MODEL_ID']
          ),
        );
      } else {
        this.storage = new FaissStore(
          await this.embeddingProvider(
            {maxRetries: 3, maxConcurrency: 10, onFailedAttempt: console.error},
            APPLICATION_CONFIGURATION['EMBEDDING_MODEL_ID']
          ),
          {}
        );
      }
    }

    return this.storage;
  }

  async flushToDisk() {
    return this.getStorage().then(storage => storage.save(this.getPersistencePath()))
  }

  async addDocuments(docs: Document[]) {
    return (await this.getStorage()).addDocuments(docs).finally(() => this.flushToDisk());
  }

  async findSimilar(query: string, k: number) {
    return (await this.getStorage()).asRetriever(k).invoke(query);
  }
}