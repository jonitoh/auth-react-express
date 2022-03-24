import axios, { AxiosInstance } from 'axios';
import store from '../../store';

interface RTResponse {
  isTokenResfreshed: boolean;
  accessToken: string;
}

export default class BaseApi {
  private _accessToken: string;

  public instance: AxiosInstance;

  public constructor(showLog = true) {
    this._accessToken = '';
    this.setAccessToken(store.use.getState().accessToken);
    this.instance = this.initiateInstance(showLog);
  }

  public setAccessToken(token: string | undefined): void {
    if (token) {
      this._accessToken = token;
    }
  }

  public deleteAccessToken(): void {
    this._accessToken = '';
  }

  public initiateInstance(showLog: boolean) {
    // create an instance with axios
    const instance: AxiosInstance = axios.create({
      // `baseURL` will be prepended to `url` unless `url` is absolute.
      baseURL: process.env.API_URL || 'http://localhost:3001/api',

      // `headers` are custom headers to be sent
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
      validateStatus(status) {
        return status >= 200 && status < 300; // default
      },

      // `maxRedirects` defines the maximum number of redirects to follow in node.js.
      // If set to 0, no redirects will be followed.
      maxRedirects: 5,
    });

    // set the Authorization header
    instance.defaults.headers.common.Authorization = `Bearer ${this._accessToken}`;

    // take advantage of interceptors: methods which are triggered before the main method
    instance.interceptors.response.use(
      // Custom logger for summarize our successful response
      (response) => {
        const {
          status,
          config: { method, url },
        } = response;
        if (showLog) {
          console.info(`METHOD=${method} SERVICE=${url} STATUS=${status}`);
        }

        return response;
      },
      // automatically refresh the tokens
      async (error) => {
        const originalRequest = error.config;
        console.info('originalRequest', originalRequest);
        if (
          error.config.url !== '/refresh-token' &&
          error.response?.status === 401 &&
          originalRequest._retry !== true
        ) {
          console.info("let's try to refresh the token");
          originalRequest._retry = true;
          try {
            const response = (await instance.get('/refresh-token')) as RTResponse | undefined;
            console.info('is the token refreshed?', !!response?.isTokenResfreshed);
            const newAccessToken = response?.accessToken;
            if (newAccessToken) {
              store.use.setState({ accessToken: newAccessToken });
            }
            this.setAccessToken(newAccessToken);
            const newAuthorization = `Bearer ${newAccessToken}`;
            instance.defaults.headers.common.Authorization = newAuthorization;
            originalRequest.headers.Authorization = newAuthorization;
          } catch (err) {
            let errorMsg = 'An error occured while trying to refresh the token';
            if (axios.isAxiosError(err)) {
              console.error(err);
              errorMsg = `Error during the refreshing token process (status ${
                err.response?.status || 'unknown'
              }):\n${err.message || 'unknown'}`;
            }
            console.error(errorMsg);
          }
          return instance(originalRequest);
        }
      }
    );

    return instance;
  }
}
