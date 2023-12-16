import get from "lodash/get";
import { sanitizeFetchType } from "react-admin";
import { LbProviderGetter } from "../helpers/lb-provider.helper";
import { getError } from "../utilities/error.utility";

export const getDataProvider = (otps: { baseUrl: string }) => {
  const dataProviderHelper = LbProviderGetter(otps);

  return (type: string, resource: string, params: any): Promise<any> => {
    const fetchType = sanitizeFetchType(type);
    const fetcher = get(dataProviderHelper, fetchType);
    if (!fetcher) {
      throw getError({
        message: "[dataProvider] Invalid fetcher to send request",
      });
    }
    return fetcher?.(resource, params);
  };
};
