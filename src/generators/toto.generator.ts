import {inject, injectable} from "inversify";
import {Toto} from "@apps/toto";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {LMSClient} from "@/clients/lms-client";
import {DocumentInterface} from "@langchain/core/documents";
import {Chat, OngoingPrediction} from "@lmstudio/sdk";
import {BaseMessage} from "@langchain/core/messages";
import moment from "moment/moment";

@injectable("Singleton")
export class TotoGenerator {
  constructor(
    @inject(LMSClient) public readonly client: LMSClient,
    @inject(Toto) private toto: Toto
  ) {
  }

  fromVectorEntriesToTextDocs(similarDocs: DocumentInterface[]) {
    return similarDocs.map(doc => doc.pageContent);
  }

  async constructChatTemplate(userPrompt: string, docs: string[]) {
    const chatPromptTemplate = ChatPromptTemplate.fromMessages([
      ['system', `Today is {today_datetime}`],
      ['system', `Context: {context}\nFrom Context answer the question. If don't know about the answer don't try to guess or generate the answer. Answer from context information only.`],
      ['system', `If today haven't index the data yet, Return to user to tell them index data please.`],
      ['user', `Question: {userInput}`],
    ])

    return chatPromptTemplate.invoke({
      today_datetime: moment().format('YYYY-MM-DD'),
      topic: "Y-Combinator",
      context: docs,
      userInput: userPrompt
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

  async prompt(userPrompt: string): Promise<OngoingPrediction> {
    const similarDocs = await this.toto.findSimilar(userPrompt, 3);

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

    const model = await this.client.selectModel('microsoft/phi-4-reasoning-plus', 8000);
    return model.respond(LMStudioChatPrompt) as OngoingPrediction;
  }
}