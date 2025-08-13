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

  selectModel(model: string) {
    return this.getClient().llm.model(model);
  }

  async selectEmbeddingModel(model: string) {
    return this.getClient().embedding.model(model);
  }
}