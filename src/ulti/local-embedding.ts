import {Embeddings, EmbeddingsParams} from "@langchain/core/embeddings";
import {LMSClient} from "@/clients/lms-client";

export type LocalEmbeddingProvider = (props: EmbeddingsParams, modelName: string) => Promise<LocalEmbedding>;

export class LocalEmbedding extends Embeddings {
  constructor(
    props: EmbeddingsParams,
    private readonly embeddingModel: string = 'text-embedding-nomic-embed-text-v1.5',
    private readonly client: LMSClient
  ) {
    super(props);
  }

  async getEmbeddingModel() {
    const loadedEmbeddings = await this.client.getClient().embedding.listLoaded();
    if (loadedEmbeddings.find(model => model.identifier === this.embeddingModel)) {
      return loadedEmbeddings.find(model => model.identifier === this.embeddingModel);
    }

    return this.client.selectEmbeddingModel(this.embeddingModel);
  }

  override async embedDocuments(documents: string[]): Promise<number[][]> {
    return this.getEmbeddingModel()
      .then((model) => model.embed(documents))
      .then((embeddedResult) => embeddedResult.map(({embedding}) => embedding))
  }

  override async embedQuery(document: string): Promise<number[]> {
    const model = await this.getEmbeddingModel();
    const {embedding} = await model.embed(document);
    return embedding;
  }
}