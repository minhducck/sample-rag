import {TotoRecordType} from "@apps/toto/types/toto-record.type";
import {subscriberFunction} from "@apps/toto/processor/subscriber/toto-crawler";
import publisherFunction from "@apps/toto/processor/publisher/toto-task-deliver";
import {inject, injectable} from "inversify";
import {LMSClient} from "@/clients/lms-client";
import moment from "moment/moment";
import {FaissStore} from "@langchain/community/vectorstores/faiss";
import {Document} from "@langchain/core/documents";
import {LocalEmbeddingProvider} from "@/ulti/local-embedding";
import {APPLICATION_CONFIGURATION} from "@/configuration/application.config";
import * as path from "node:path";
import * as process from "node:process";
import * as fs from "node:fs";
import {FaissStoreService} from "@/storages/faiss-store.service";

@injectable()
export class Toto {
  storage: FaissStore = null

  constructor(
    @inject(LMSClient) public readonly client: LMSClient,
    @inject(FaissStoreService) public readonly persistence: FaissStoreService,
  ) {
  }


  async retrieveTotoResult(limit: number = 30): Promise<TotoRecordType[]> {
    const data: TotoRecordType[] = [];

    const onData = (result: TotoRecordType) => {
      data.push(result);
    }

    await subscriberFunction(onData).then((subscriber) => publisherFunction(limit));

    return data;
  }

  prepareChunking(totoData: TotoRecordType[]) {
    const SGDFormatter = new Intl.NumberFormat('en-SG', {
      currency: "SGD",
      useGrouping: true,
      style: "currency",
    });

    return totoData.map(item => ({
      text: [`[Toto Result] Draw: ${moment(item.DrawDate).format('YYYY-MM-DD')}`,
        `Price: ${SGDFormatter.format(Number(item.FirstPrice))}`,
        `Original Numbers: ${[item.Num1, item.Num2, item.Num3, item.Num4, item.Num5, item.Num6].join(', ')}`,
        `Additional: ${item.AdditionalNum}`].join('|'),
      metadata: {id: item.DrawId, timestamp: moment(item.DrawDate).unix()}
    }));
  }

  async saveToStore(data: TotoRecordType[]) {
    const chunks = this.prepareChunking(data);
    const docs = chunks.map(chunk => ({
      pageContent: chunk.text,
      id: chunk.metadata.id,
      metadata: chunk.metadata
    } as Document));
    return this.persistence.addDocuments(docs)
  }
}