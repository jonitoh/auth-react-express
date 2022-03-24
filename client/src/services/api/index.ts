import AuthApi from './auth.api';
import ProductKeyApi from './product-key.api';
import UserApi from './user.api';
import FakeApi from './fake.api';

export default function instanciateApi(showLog = true) {
  const api = {
    authApi: new AuthApi(showLog),
    productKeyApi: new ProductKeyApi(showLog),
    userApi: new UserApi(showLog),
    fakeApi: new FakeApi(showLog),
  };
  return api;
}
