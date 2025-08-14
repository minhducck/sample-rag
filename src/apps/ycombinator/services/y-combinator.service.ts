import {injectable} from "inversify";
import {HttpClient} from "@/clients/http.client";
import * as http from "http";
import * as https from "https";
import * as cheerio from 'cheerio';
import {AxiosInstance} from "axios";

@injectable()
export class YCombinatorService {
  protected client: AxiosInstance;

  constructor() {
    this.client = HttpClient.createClient({
      httpAgent: new http.Agent({keepAlive: true}),
      httpsAgent: new https.Agent({keepAlive: true}),
      decompress: true,
    })
  }

  protected getClient(): AxiosInstance {
    return this.client;
  }

  protected getHtmlParser(htmlContent: string) {
    return cheerio.load(htmlContent, null, true);
  }
}
