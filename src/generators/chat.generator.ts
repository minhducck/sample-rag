import {inject, injectable} from "inversify";
import {Toto} from "@apps/toto";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {LMSClient} from "@/clients/lms-client";
import {DocumentInterface} from "@langchain/core/documents";
import {Chat, OngoingPrediction} from "@lmstudio/sdk";
import {BaseMessage} from "@langchain/core/messages";
import moment from "moment/moment";
import * as process from "node:process";
import {FaissStoreService} from "@/storages/faiss-store.service";
import {APPLICATION_CONFIGURATION} from "@/configuration/application.config";

@injectable("Singleton")
export class ChatGenerator {
  constructor(
    @inject(LMSClient) public readonly client: LMSClient,
    @inject(FaissStoreService) public readonly persistence: FaissStoreService,
  ) {
  }

  fromVectorEntriesToTextDocs(similarDocs: DocumentInterface[]) {
    return similarDocs.map(doc => doc.pageContent);
  }

  async constructChatTemplate(userPrompt: string, docs: string[]) {
    const chatPromptTemplate = ChatPromptTemplate.fromMessages([
      ['system', `Today is {today_datetime}`],
      ['system', `Current unix timestamp is {timestamp}`],
      ['system', `Context: {context}\nFrom Context answer the question. If don't know about the answer don't try to guess or generate the answer. Answer from context information only.`],
      ['system', `If today haven't index the data yet, Return to user to tell them index data please.`],
      ['user', `Question: {userInput}`],
    ])

    return chatPromptTemplate.invoke({
      today_datetime: moment().format('YYYY-MM-DD'),
      context: docs,
      userInput: userPrompt,
      timestamp: moment().unix()
    })
  }

  private resolveRoleFromLangChainMessage(message: BaseMessage): "user" | "assistant" | "system" {
    switch (message.constructor.name) {
      case "SystemMessage":
        return 'system';
      case "HumanMessage":
        return 'user';
      default:
        return 'assistant';
    }
  }

  async prompt(userPrompt: string): Promise<string> {
    const similarDocs = await this.persistence.findSimilar(userPrompt, 3);

    similarDocs.forEach((doc) => {
      console.log(`[Content]: ${doc.pageContent}.\n\n[From]: ${doc.metadata.source}`)
    });

    // Constructing Chat
    const chatPrompt = await this.constructChatTemplate(
      userPrompt,
      this.fromVectorEntriesToTextDocs(similarDocs)
    );


    const LMStudioChatPrompt = Chat.empty();
    chatPrompt.toChatMessages().forEach(message => {
      LMStudioChatPrompt.append({
        content: message.text,
        role: this.resolveRoleFromLangChainMessage(message)
      });
    });

    const model = await this.client.selectModel(
      APPLICATION_CONFIGURATION['LLM_MODEL_ID'],
      +APPLICATION_CONFIGURATION['LLM_CONTEXT_LENGTH'] || 4096,
    );

    let response = '';
    for await (const fragment of model.respond(LMStudioChatPrompt)) {
      process.stdout.write(fragment.content);
      response = fragment.content;
    }
    return response;
  }
}