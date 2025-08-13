import axios, {Axios, AxiosRequestConfig} from 'axios';

export class HttpClient {
  protected client: typeof Axios | null = null;

  protected static defaultConfiguration: AxiosRequestConfig = {};

  static createClient(config: AxiosRequestConfig) {
    const client = axios.create({
      ...this.defaultConfiguration,
      ...config,
    });

    return new Proxy(client, {
      get: function get(target, name) {
        return function wrapper() {
          return client.call(name, ...arguments);
        }
      }
    });
  }
}
