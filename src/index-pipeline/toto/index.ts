import {subscriberFunction} from "@apps/toto/processor/subscriber/toto-crawler.js";
import publisherFunction from "@apps/toto/processor/publisher/toto-task-deliver.js";
import {TotoRecordType} from "@apps/toto/types/toto-record.type.js";


export async function indexToto() {
  const data: TotoRecordType[] = [];

  const onData = (result: TotoRecordType) => {
    data.push(result);
  }

  await subscriberFunction(onData).then((subscriber) => publisherFunction());

  return data;
}