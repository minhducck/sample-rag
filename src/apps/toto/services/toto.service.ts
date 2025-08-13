import {injectable} from "inversify";
import {HttpClient} from "../../../clients/http.client";
import * as http from "http";
import * as https from "https";
import * as cheerio from 'cheerio';
import {AxiosInstance} from "axios";
import {DrawRecordType} from "../types/draw-record.type";
import {TotoRecordType} from "../types/toto-record.type";
import moment from "moment/moment";

const DATA_BASE_URL = 'https://www.singaporepools.com.sg/';
const TOTO_RESULT_URL = 'en/product/sr/Pages/toto_results.aspx'
const GET_DRAW_LISTING_URL = 'DataFileArchive/Lottery/Output/toto_result_draw_list_en.html';

@injectable()
export class TotoService {
  protected client

  constructor() {
    this.client = HttpClient.createClient({
      baseURL: DATA_BASE_URL,
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

  public async getListOfAvailableResults() {
    const htmlContent = await this.getClient().get(GET_DRAW_LISTING_URL);
    if (!htmlContent?.data) {
      throw new Error(`There is no content provided from the target link: ${TOTO_RESULT_URL}`);
    }

    const $ = this.getHtmlParser(htmlContent.data)
    const drawList: DrawRecordType[] = [];

    if ($('select.selectDrawList option').length) {
      $('select.selectDrawList option').each(function () {
        drawList.push(<DrawRecordType>{
          drawId: $(this).attr('value'),
          queryString: $(this).attr('querystring'),
        })
      })
    }
    return drawList;
  }

  async getResultFromDrawRecord(drawRecord: DrawRecordType) {
    const resultPageUrl = this.getResultUri(drawRecord);
    const drawContentPage = await this.getClient().get(resultPageUrl.toString());
    if (!drawContentPage?.data) {
      throw new Error(`Result page was unable to process: ${drawRecord.drawId}`);
    }

    const $ = this.getHtmlParser(drawContentPage?.data)
    const drawResult: TotoRecordType = {
      DrawId: drawRecord.drawId,
      DrawNo: drawRecord.drawId,
      DrawDate: moment($('.toto-result th.drawDate').text(), 'ddd, DD MMM YYYY', 'en_SG').toDate(),
      FirstPrice: $('td.jackpotPrize').text().replace(/[^\d.-]/g, ''),
      Num1: $('div.toto-result td.win1').text(),
      Num2: $('div.toto-result td.win2').text(),
      Num3: $('div.toto-result td.win3').text(),
      Num4: $('div.toto-result td.win4').text(),
      Num5: $('div.toto-result td.win5').text(),
      Num6: $('div.toto-result td.win6').text(),
      AdditionalNum: $('div.toto-result td.additional').text()
    }

    if (drawRecord.drawId != drawRecord.drawId) {
      throw Error(`The draw ${drawRecord.drawId} is not exist.`);
    }
    return drawResult;
  }

  private getResultUri(drawRecord: DrawRecordType) {
    return [TOTO_RESULT_URL, drawRecord.queryString].join('?')
  }
}
