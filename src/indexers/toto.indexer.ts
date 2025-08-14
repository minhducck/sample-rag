import {inject} from "inversify";
import {Toto} from "@apps/toto";
import {Container} from "@/configuration/container";
import moment from "moment";

class TotoIndexer {
  constructor(
    @inject(Toto) private toto: Toto
  ) {
  }

  async main() {
    // Index Pipeline
    const totoData = await this.toto.retrieveTotoResult(10000);
    console.log("Toto Data", totoData.map(record => moment(record.DrawDate).format('YYYY-MM-DD')));
    await this.toto.saveToStore(totoData);
    console.log(`Saved to Vector Store`);
    console.log(`Indexed Toto Done.`);
  }
}

const mainProcess = Container.getInstance().get(TotoIndexer)!;
void mainProcess.main();