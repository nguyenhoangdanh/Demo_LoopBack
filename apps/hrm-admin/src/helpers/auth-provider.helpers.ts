import { AuthService } from "@/services/auth.service";
import { BASE_URL, PATH } from "../common";
import { LbProviderGetter } from "./lb-provider.helper";

const authService = AuthService.getInstance();

export const authProvider = {
  // called when the user attempts to log in
  login: ({ username, password }: { username: string; password: string }) => {
    const handleLogin = async () => {
      const account = {
        identifier: {
          scheme: "username",
          value: username,
        },
        credential: {
          scheme: "basic",
          value: password,
        },
      };

      try {
        const { data } = (await LbProviderGetter({ baseUrl: BASE_URL }).send(
          `${PATH.AUTH}/${PATH.SIGN_IN}`,
          { method: "post", data: account }
        )) as any;

        localStorage.setItem("token", data?.token?.value);
        localStorage.setItem("userId", data?.userId);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    };

    return handleLogin();
  },
  // called when the user clicks on the logout button
  logout: () => {
    localStorage.removeItem("token");
    return Promise.resolve();
  },
  // called when the API returns an error
  checkError: (params: any) => {
    const { status } = params;
    if (status === 401 || status === 403) {
      return Promise.reject({ redirectTo: `/${PATH.LOGIN}` });
    }

    return Promise.resolve();
  },
  // -------------------------------------------------------------
  // CHECK_AUTH
  // -------------------------------------------------------------
  checkAuth: () => {
    const token = authService.getAuthToken();

    if (!token) {
      return Promise.reject({ redirectTo: `/${PATH.LOGIN}` });
    }

    return new Promise<void>((resolve, reject) => {
      LbProviderGetter({ baseUrl: BASE_URL })
        .send(`${PATH.AUTH}/${PATH.WHO_AM_I}`, { method: "get" })
        .then((rs: any) => {
          if (!rs?.data?.userId) {
            return reject({ redirectTo: `/${PATH.LOGIN}` });
          }

          resolve();
        })
        .catch((error) => {
          console.error("[checkAuth] Error: ", error);
          /* reject({ redirectTo: `/${PATH.LOGIN}` }); */
        });
    });
  },
  // called when the user navigates to a new location, to check for permissions / roles
  getPermissions: async () => {
    const iAm: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(`${PATH.AUTH}/${PATH.WHO_AM_I}`, {
      method: "get",
    });
    const roles: string[] = iAm?.data?.roles?.map(
      (role: string) => role.split("|")[1]
    );
    return roles.length !== 0 ? Promise.resolve(roles) : Promise.reject();
  },
};
