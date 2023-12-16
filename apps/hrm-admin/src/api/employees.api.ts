import { BASE_URL, PATH } from "@/common";
import { LbProviderGetter } from "@/helpers";

export const getEmployeesNotInDepartments = (): Promise<any> => {
  return LbProviderGetter({
    baseUrl: BASE_URL,
  }).send(`${PATH.USERS}/not-in-departments`, {
    method: "get",
  });
};
