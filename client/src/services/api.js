const userLoginWithCredentials = async ({ email, password }) => {
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

const userLoginWithProductKey = async ({ productKey }) => {
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

const userLogin = async ({ email, password, productKey, onCredentials }) =>
  onCredentials
    ? await userLoginWithCredentials({ email, password })
    : await userLoginWithProductKey({ productKey });

const signUp = async ({ email, password, productKey }) => {
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

export { userLogin, signUp };
