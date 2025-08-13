import {Container} from "@/configuration/container";
import {PubSubManager} from "../../PubSubManager";
import {APPLICATION_CONFIGURATION} from "@/configuration/application.config";
import {QueueMessageType} from "../../types/queue-message.type";
import {delay} from "../../helper/delay.helper";
import {TotoService} from "../../services/toto.service";
import {DrawRecordType} from "../../types/draw-record.type";

const container = Container.getInstance();

export async function publisherFunction(limit = 30) {
  const totoService: TotoService = container.get<TotoService>(TotoService);
  const channelName = APPLICATION_CONFIGURATION['TOTO_CHANNEL_NAME'].toUpperCase();
  const publisher = await container.get<PubSubManager>(PubSubManager).registerPublisher(channelName).then((publisher) => {
    console.debug(`[${channelName}][Publisher][${new Date().toISOString()}]: Initialized publisher for "${channelName}" channel.`);
    return publisher;
  });

  const drawList: DrawRecordType[] = await totoService.getListOfAvailableResults();
  let counter = 0;
  for (const drawRecord of drawList) {
    const task = {data: drawRecord, topicId: "crawl_toto_result_page"} as QueueMessageType
    console.debug(`[${channelName}][Publisher][${new Date().toISOString()}]: Published message to "${channelName}:"`);
    // @ts-ignore
    await publisher.publish(channelName, JSON.stringify(task)).then(async () => await delay(+APPLICATION_CONFIGURATION['SLEEP_EACH_REQUEST']));
    if (counter++ >= limit) {
      console.log("Reached limit task")
      break;
    }
  }
}

export default publisherFunction;