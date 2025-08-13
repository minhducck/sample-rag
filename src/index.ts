import {Chat, LMStudioClient} from "@lmstudio/sdk";
import {indexToto} from "@/index-pipeline/toto";
import moment from "moment";
import {ChatPromptTemplate, PromptTemplate} from "@langchain/core/prompts";
import * as process from "node:process";
import {inject} from "inversify";
import {Toto} from "@apps/toto";
import {Container} from "@/configuration/container";
import {LMSClient} from "@/clients/lms-client";

const client = new LMStudioClient();

async function main() {
  // Indexing data
  const totoData = await indexToto();
  const SGDFormatter = new Intl.NumberFormat('en-SG', {
    currency: "SGD",
    useGrouping: true,
    style: "currency",
  });

  const docChunks = totoData.map(item =>
    [
      `Draw: ${moment(item.DrawDate).format('YYYY-MM-DD')}`,
      `Price: ${SGDFormatter.format(Number(item.FirstPrice))}`,
      `Original Numbers: ${[item.Num1, item.Num2, item.Num3, item.Num4, item.Num5, item.Num6].join(', ')}`,
      `Additional: ${item.AdditionalNum}`,
    ].join('|')
  );

  const model = await client.llm.model('openai/gpt-oss-20b');


  // Constructing Chat
  const systemMessageTemplate = PromptTemplate.fromTemplate(
    `Topic: {topic}\nContext: {context}\nFrom Context answer the question. If don't know about the answer don't try to guess or generate the answer. Answer from context information only.`
  )
  const sysRoleMess = await systemMessageTemplate.invoke({
    topic: "Singapore TOTO",
    context: docChunks.join('\n\n'),
  })


  const userMessageTemplate = ChatPromptTemplate.fromTemplate(
    `Question: {userInput}`
  )

  // const userMessage = await userMessageTemplate.invoke({userInput: "Dont show me your counting. Tell me What is the most freq number in TOTO results?"})
  const userMessage = await userMessageTemplate.invoke({
    userInput: "What is the most similar pairs of numbers in the Toto result?"
  })
  const chat = Chat.empty();
  chat.append("system", sysRoleMess.value)
  userMessage.toChatMessages().forEach((message) => {
    chat.append("user", message.text)
  });

  // Generating
  const prediction = model.respond(chat);
  let fullContent = ''

  for await (const {content} of prediction) {
    fullContent += content;
    process.stdout.write(content);
  }

  process.stdout.write("Final Result:");
  process.stdout.write(fullContent);


  // Flush STDOUT
  console.info();
}

//void main();

class MainProcess {
  constructor(
    @inject(LMSClient) private readonly lmsClient: LMSClient,
    @inject(Toto) private toto: Toto
  ) {
  }

  async main() {
    // Index Pipeline
    const totoData = await this.toto.retrieveTotoResult();
    console.log("Toto Data", totoData);

    const savedData = await this.toto.saveToStore(totoData);
    console.log(`Saved to Vector Store`);

    // Query similar from index db
    const retrievalData = await this.toto.findSimilar('How many 12 million do you have', 5);
    console.log("RetrievalData", retrievalData);
  }
}

const mainProcess = Container.getInstance().get(MainProcess)!;
void mainProcess.main();