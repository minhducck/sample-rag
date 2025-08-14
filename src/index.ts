import * as process from "node:process";
import {inject} from "inversify";
import {Container} from "@/configuration/container";
import {TotoGenerator} from "@/generators/toto.generator";

class MainProcess {
  constructor(
    @inject(TotoGenerator) private totoGenerator: TotoGenerator
  ) {
  }

  async main(userPrompt: string) {
    let showLoading = false;
    let counter = 0;

    const loadingInterval = setInterval(() => {
      if (showLoading) {
        // process.stdout.moveCursor(0, 0)
        process.stdout.cursorTo(0)
        process.stdout.clearScreenDown()
        process.stdout.write(`Loading` + '.'.repeat(counter++));
        counter %= 4;
      }
    }, 300);
    console.log(`User asking about ${userPrompt}`);
    showLoading = true;
    const predict = await this.totoGenerator.prompt(userPrompt)
    showLoading = false;
    process.stdout.write(predict.content);
    process.stdout.write("\n");
    process.stdout.write("Bye byte!\n")
    process.exit(0)
  }
}

const mainProcess = Container.getInstance().get(MainProcess)!;

// argv2 = User Prompt.
void mainProcess.main(process.argv[2]);