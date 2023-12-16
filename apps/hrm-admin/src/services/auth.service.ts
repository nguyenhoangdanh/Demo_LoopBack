export class AuthService {
  private static instance: AuthService;

  constructor() {}

  static getInstance(): AuthService {
    if (!this.instance) {
      this.instance = new AuthService();
    }

    return this.instance;
  }

  // ------------------------------------------------------------------------------------
  getSr(user: any) {
    const { id = 0, username = "", email = "", status = "" } = user;
    return `${id}_${username}@@${email}_${status}@mT5h`;
  }

  // ------------------------------------------------------------------------------------
  // getUser() {
  //   return JSON.parse(localStorage.getItem(LocalStorageKeys.KEY_AUTH_IDENTITY) || '{}');
  // }

  // // ------------------------------------------------------------------------------------
  // getRoles = () => {
  //   const roles = JSON.parse(localStorage.getItem(LocalStorageKeys.KEY_AUTH_PERMISSION) || '[]');
  //   return new Set(roles);
  // };

  // ------------------------------------------------------------------------------------
  getAuthToken() {
    try {
      // const user = this.getUser();
      // const sr = this.getSr(user);

      const encryptedToken = localStorage.getItem("token") ?? "";
      return encryptedToken;
    } catch (e) {
      return null;
    }
  }

  // ------------------------------------------------------------------------------------
  // saveAuthIdentify(opts: { userId: number;[key: string]: any }) {
  //   localStorage.setItem(LocalStorageKeys.KEY_AUTH_IDENTITY, JSON.stringify(opts));
  // }

  // // ------------------------------------------------------------------------------------
  // saveAuthToken(opts: { value: string; type: string }) {
  //   localStorage.setItem(LocalStorageKeys.KEY_AUTH_TOKEN, JSON.stringify(opts));
  // }

  // // ------------------------------------------------------------------------------------
  // cleanUp() {
  //   localStorage.removeItem(LocalStorageKeys.KEY_AUTH_TOKEN);
  // }
}
