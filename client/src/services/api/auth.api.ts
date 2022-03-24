import BaseApi from './base.api';

export default class AuthApi extends BaseApi {
  public async register(
    {
      email,
      username,
      password,
      productKey,
      roleName = undefined,
      roleId = undefined,
      forceRole = true,
    }: {
      email: string;
      username: string;
      password: string;
      productKey: string;
      roleName?: string;
      roleId?: string;
      forceRole?: boolean;
    } /* 
    { roleName, roleId, forceRole } should be used when an user 
    with the right authorization registers someone in the database
    */
  ) {
    return this.instance.post('/auth/register', {
      email,
      username,
      password,
      productKey,
      roleName,
      roleId,
      forceRole,
    });
  }

  public async signInWithEmail({ email, password }: { email: string; password: string }) {
    return this.instance.post('/auth/sign-in/credentials', {
      email,
      password,
    });
  }

  public async signInWithProductKey({ productKey }: { productKey: string }) {
    return this.instance.post('/auth/sign-in/product-key', {
      productKey,
    });
  }

  public async signIn({
    email,
    password,
    productKey,
    onCredentials,
  }: {
    email: string;
    password: string;
    productKey: string;
    onCredentials: boolean;
  }) {
    return onCredentials
      ? this.signInWithEmail({ email, password })
      : this.signInWithProductKey({ productKey });
  }

  public async signOut() {
    return this.instance.get('/auth/sign-out');
  }
}
