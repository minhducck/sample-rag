import {inject, injectable} from "inversify";
import {Container} from "@/configuration/container";
import {Ycombinator} from "@apps/ycombinator";

@injectable()
class YcombinatorIndexer {
  constructor(
    @inject(Ycombinator) private ycombinator: Ycombinator
  ) {
  }

  async main() {
    const posts = await this.ycombinator.getRecentRssFeed();
    for (const post of posts) {
      console.log(`Indexing comments post: ${post.title}`)
      const chunks = await this.ycombinator.loadCommentChunksFromPost(post);
      await this.ycombinator.saveToStore(chunks);
    }
  }
}

const mainProcess = Container.getInstance().get(YcombinatorIndexer)!;
void mainProcess.main();