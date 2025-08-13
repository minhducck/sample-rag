import {Container as InversifyContainer, ResolutionContext} from 'inversify'
import {LocalEmbedding, LocalEmbeddingProvider} from "@/ulti/local-embedding";
import {LMSClient} from "@/clients/lms-client";


export class Container {
  private static container: InversifyContainer | null = null;

  static getInstance = () => {
    if (this.container === null) {
      this.container = new InversifyContainer({
        defaultScope: "Singleton",
        autobind: true,
      });

      this.container
        .bind<LocalEmbeddingProvider>('LocalEmbeddingProvider')
        .toProvider((context: ResolutionContext) => {
          return async (params, modelName) => {
            const client = this.container.get(LMSClient);
            return new LocalEmbedding(params, modelName, client)
          }
        });
    }
    return this.container
  }
}
