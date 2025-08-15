import {LMStudioClient} from "@lmstudio/sdk";
import {injectable} from "inversify";
import moment from "moment";

@injectable()
export class LMSClient {
  client: LMStudioClient = null;

  getClient() {
    if (this.client === null) {
      this.client = new LMStudioClient({logger: console, verboseErrorMessages: true});
    }
    return this.client;
  };

  selectModel(model: string, contextLength: number = 4096) {
    return this.getClient().llm.model(model, {
      config: {
        contextLength,
        keepModelInMemory: true,
        seed: moment().unix(),
      }
    });
  }

  async selectEmbeddingModel(model: string) {
    return this.getClient().embedding.model(model);
  }
}