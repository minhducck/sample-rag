import {LMStudioClient} from "@lmstudio/sdk";
import {injectable} from "inversify";

@injectable()
export class LMSClient {
  client: LMStudioClient = null;

  getClient() {
    if (this.client === null) {
      this.client = new LMStudioClient({logger: console, verboseErrorMessages: true});
    }
    return this.client;
  };

  selectModel(model: string, contextLength = 4096) {
    return this.getClient().llm.model(model, {config: {contextLength}});
  }

  async selectEmbeddingModel(model: string) {
    return this.getClient().embedding.model(model);
  }
}