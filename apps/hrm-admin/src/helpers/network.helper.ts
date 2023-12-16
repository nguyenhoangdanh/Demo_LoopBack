import { stringify } from "../utilities/url.utility";

const HTTP = "http";
const HTTPS = "https";

interface IRequestOptions {
  url: string;
  method?: "get" | "post" | "put" | "patch" | "delete" | "options";
  params?: object;
  body?: object;
  configs?: object;
}

// -------------------------------------------------------------
export class NetworkHelper {
  private name: string;

  constructor(opts: { name: string; logger?: any }) {
    const { name } = opts;
    this.name = name;
    opts?.logger?.info(
      "Creating new network request worker instance! Name: %s",
      this.name
    );
  }

  getProtocol(url: string) {
    return url.startsWith("http:") ? HTTP : HTTPS;
  }

  // -------------------------------------------------------------
  // SEND REQUEST
  // -------------------------------------------------------------
  async send(opts: IRequestOptions, logger?: any) {
    const t = new Date().getTime();

    const { url, method = "get", params, body, configs } = opts;
    const props = {
      method: method.toUpperCase(),
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...configs,
    };

    let requestUrl = url;
    if (params) {
      requestUrl = `${url}?${stringify(params)}`;
    }

    logger?.info("[send] URL: %s | Props: %o", requestUrl, props);
    const response = await fetch(requestUrl, props);

    logger?.info(`[network]][send] Took: %s(ms)`, new Date().getTime() - t);
    return response;
  }

  // -------------------------------------------------------------
  // GET REQUEST
  // -------------------------------------------------------------
  async get(opts: IRequestOptions) {
    const { url, params, configs, ...rest } = opts;
    const response = await this.send({
      ...rest,
      url,
      method: "get",
      params,
      configs,
    });
    return response;
  }

  // -------------------------------------------------------------
  // POST REQUEST
  // -------------------------------------------------------------
  async post(opts: IRequestOptions) {
    const { url, body, configs, ...rest } = opts;
    const response = await this.send({
      ...rest,
      url,
      method: "post",
      body,
      configs,
    });
    return response;
  }

  // -------------------------------------------------------------
  async put(opts: IRequestOptions) {
    const { url, body, configs, ...rest } = opts;
    const response = await this.send({
      ...rest,
      url,
      method: "put",
      body,
      configs,
      ...rest,
    });
    return response;
  }

  // -------------------------------------------------------------
  async patch(opts: IRequestOptions) {
    const { url, body, configs, ...rest } = opts;
    const response = await this.send({
      ...rest,
      url,
      method: "patch",
      body,
      configs,
    });
    return response;
  }

  // -------------------------------------------------------------
  async delete(opts: IRequestOptions) {
    const { url, configs, ...rest } = opts;
    const response = await this.send({
      ...rest,
      url,
      method: "delete",
      configs,
    });
    return response;
  }
}
