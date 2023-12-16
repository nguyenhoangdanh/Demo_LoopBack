export const stringify = (params: Record<string | symbol, any>) => {
  const normalizedParams: Record<string | symbol, any> = {};
  for (const key in params) {
    switch (typeof params[key]) {
      case "number":
      case "string": {
        normalizedParams[key] = params[key];
        break;
      }
      default: {
        normalizedParams[key] = JSON.stringify(params[key]);
        break;
      }
    }
  }
  const rs = new URLSearchParams(normalizedParams);
  return rs.toString();
};

export const parse = (searchString: string) => {
  const searchParams = new URLSearchParams(searchString);
  return Object.fromEntries(searchParams);
};
