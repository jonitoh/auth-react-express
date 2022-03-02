import axios from "axios";
import store from "store";

class BaseApi {
  constructor(showLog = true) {
    this._accessToken = "";
    this.setAccessToken(store.use.getState().accessToken);
    this.instance = this.initiateInstance(showLog);
  }

  setAccessToken = (token) => {
    if (token) {
      this._accessToken = token;
    }
  };

  deleteAccessToken = () => {
    this._accessToken = "";
  };

  initiateInstance = (showLog) => {
    //console.log("tok", this._accessToken);
    // create an instance with axios
    const instance = axios.create({
      // `baseURL` will be prepended to `url` unless `url` is absolute.
      baseURL: process.env.API_URL || "http://localhost:3001/api",

      // `headers` are custom headers to be sent
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      // `timeout` specifies the number of milliseconds before the request times out.
      // If the request takes longer than `timeout`, the request will be aborted.
      timeout: 2000,

      // `withCredentials` indicates whether or not cross-site Access-Control requests
      // should be made using credentials
      withCredentials: true,

      // `validateStatus` defines whether to resolve or reject the promise for a given
      // HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
      // or `undefined`), the promise will be resolved; otherwise, the promise will be
      // rejected.
      validateStatus: function (status) {
        return status >= 200 && status < 300; // default
      },

      // `maxRedirects` defines the maximum number of redirects to follow in node.js.
      // If set to 0, no redirects will be followed.
      maxRedirects: 5,
    });

    // set the Authorization header
    instance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${this._accessToken}`;

    // take advantage of interceptors: methods which are triggered before the main method
    instance.interceptors.response.use(
      // Custom logger for summarize our successful response
      (response) => {
        const {
          status,
          config: { method, url },
        } = response;
        if (showLog) {
          console.log(`METHOD=${method} SERVICE=${url} STATUS=${status}`);
        }

        return response;
      },
      // automatically refresh the tokens
      async (error) => {
        console.log("&&error", error);

        const originalRequest = error.config;
        console.log("originalRequest", originalRequest);
        if (
          error.config.url !== "/refresh-token" &&
          error.response.status === 401 &&
          originalRequest._retry !== true
        ) {
          console.log("let's try to refresh the token");
          originalRequest._retry = true;
          try {
            const response = await instance.get("/refresh-token");
            console.log(
              "is the token refreshed?",
              !!response?.isTokenResfreshed
            );
            const newAccessToken = response?.accessToken;
            store.use.setState({ accessToken: newAccessToken });
            this.setAccessToken(newAccessToken);
            const newAuthorization = `Bearer ${newAccessToken}`;
            instance.defaults.headers.common["Authorization"] =
              newAuthorization;
            originalRequest.headers["Authorization"] = newAuthorization;
          } catch (error) {
            console.log(
              `Error during the refreshing token process (status ${error.response.status}):\n${error.message}`
            );
          }
          return instance(originalRequest);
        }
      }
    );

    return instance;
  };
}

class FakeApi {
  constructor() {
    this.instance = {};
  }

  fakeApiCall = async (
    data,
    condition = (data) => true,
    successMsg = "successful fake API call",
    errorMsg = "error on the fake API call",
    timing = 3000
  ) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (condition(data)) {
          console.log(successMsg);
          resolve();
        } else {
          console.log(errorMsg);
          reject();
        }
      }, timing);
    });
  };
}

class AuthApi extends BaseApi {
  register = async ({
    email,
    username,
    password,
    productKey,
    roleName = undefined,
    roleId = undefined,
    forceRole = true,
  }) => {
    /* 
    { roleName, roleId, forceRole } should be used when an user 
    with the right authorization registers someone in the database
    */
    return await this.instance.post("/auth/register", {
      email,
      username,
      password,
      productKey,
      roleName,
      roleId,
      forceRole,
    });
  };

  signInWithEmail = async ({ email, password }) => {
    return await this.instance.post("/auth/sign-in/credentials", {
      email,
      password,
    });
  };

  signInWithProductKey = async ({ productKey }) => {
    return await this.instance.post("/auth/sign-in/product-key", {
      productKey,
    });
  };

  signIn = async ({ email, password, productKey, onCredentials }) =>
    onCredentials
      ? await this.signInWithEmail({ email, password })
      : await this.signInWithProductKey({ productKey });

  signOut = async () => {
    return await this.instance.get("/auth/sign-out");
  };
}

class ProductKeyApi extends BaseApi {
  // url-prefix "/product-key"
}

class UserApi extends BaseApi {
  getInfo = async (userId) => {
    return await this.instance.get("/user/info/" + userId);
  };

  getAllInfo = async (options = {}) => {
    return await this.instance.get("/user/info/", options);
  };

  getAllAccess = async () => {
    return await this.instance.get("/user/access");
  };

  getUser = async (userId) => {
    return await this.instance.get("/user" + userId);
  };

  deleteUser = async (userId) => {
    return await this.instance.delete("/user", { params: { _id: userId } });
  };

  updateUser = async (data) => {
    return await this.instance.post("/user", data);
  };

  getModeratorStats = async () => {
    return await this.instance.get("/user/mod");
  };

  getAdminStats = async () => {
    return await this.instance.get("/user/admin");
  };
}

/* HELPER-RESPONSE
export function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if ([401, 403].indexOf(response.status) !== -1) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                authenticationService.logout();
                location.reload(true);
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}
*/

export default function instanciateApi(showLog = true) {
  const api = {
    authApi: new AuthApi(showLog),
    productKeyApi: new ProductKeyApi(showLog),
    userApi: new UserApi(showLog),
    fakeApi: new FakeApi(showLog),
  };
  return api;
}
