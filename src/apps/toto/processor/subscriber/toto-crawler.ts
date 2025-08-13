import {Container} from "@/configuration/container";
import {PubSubManager} from "../../PubSubManager";
import {APPLICATION_CONFIGURATION} from "@/configuration/application.config";
import {QueueMessageType} from "../../types/queue-message.type";
import {DrawRecordType} from "../../types/draw-record.type";
import {TotoService} from "../../services/toto.service";
import {TotoRecordType} from "@apps/toto/types/toto-record.type";

const container = Container.getInstance();
const totoService = container.get<TotoService>(TotoService)

async function executeTotoResult(drawRecord: DrawRecordType, onData?: (drawRecord: TotoRecordType) => any) {
  try {
    const data = await totoService.getResultFromDrawRecord(drawRecord);
    if (onData) onData(data);
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function subscriberFunction(onData?: (drawRecord: TotoRecordType) => any) {
  const channelName = APPLICATION_CONFIGURATION['TOTO_CHANNEL_NAME'].toUpperCase();
  const subscriber = await container.get<PubSubManager>(PubSubManager).registerSubscriber(channelName);

  subscriber.subscribe(channelName, function (message, channel) {
    const queueMessage = JSON.parse(message) as QueueMessageType;
    console.debug(`[${channelName}][Subscriber][${new Date().toISOString()}]: Received message from ${channelName}:`)
    executeTotoResult(queueMessage.data as DrawRecordType, onData)

  }).then(() => {
    console.debug(`[${channelName}][Subscriber][${new Date().toISOString()}]: Subscribed handler to "${channelName}" channel.`);
  });

  return subscriber;
}
