import axios from "axios";

// constants
const API_URL = "http://localhost:3000/";

// instance stuff

// helper functions
const authHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.accessToken) {
    return { "x-access-token": user.accessToken };
  } else {
    return {};
  }
};

// AuthService
class _AuthService {
  _loginWithCredentials = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "test@test.fr" && password === "password") {
          resolve();
        } else {
          reject();
        }
      }, 3000);
    });
  };

  loginWithCredentials = async (email, password) => {
    return await axios
      .post(API_URL + "auth/signin/credentials", {
        email,
        password,
      })
      .then((response) => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return response.data;
      });
  };

  _loginWithProductKey = async (productKey) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (productKey === "1234") {
          resolve();
        } else {
          reject();
        }
      }, 3000);
    });
  };

  loginWithProductKey = async (productKey) => {
    return await axios
      .post(API_URL + "auth/signin/product-key", {
        productKey,
      })
      .then((response) => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return response.data;
      });
  };

  login = async ({ email, password, productKey, onCredentials }) =>
    onCredentials
      ? await this._loginWithCredentials(email, password)
      : await this._loginWithProductKey(productKey);

  logout = () => localStorage.removeItem("user");

  _register = async ({ email, password, productKey }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "" || password === "" || productKey === "") {
          reject();
        } else {
          resolve();
        }
      }, 3000);
    });
  };

  register = async ({ email, password, productKey }) => {
    return await axios.post(API_URL + "auth/register", {
      email,
      password,
      productKey,
    });
  };

  getCurrentUser = () => JSON.parse(localStorage.getItem("user"));
}
const AuthService = new _AuthService();

// UserService
class _UserService {
  getPublicContent = async () => {
    return await axios.get(API_URL + "test/all");
  };

  getUserBoard = async () => {
    return await axios.get(API_URL + "test/user", { headers: authHeader() });
  };

  getModeratorBoard = async () => {
    return await axios.get(API_URL + "test/mod", { headers: authHeader() });
  };

  getAdminBoard = async () => {
    return await axios.get(API_URL + "test/admin", { headers: authHeader() });
  };
}
const UserService = new _UserService();

export { AuthService, UserService };
