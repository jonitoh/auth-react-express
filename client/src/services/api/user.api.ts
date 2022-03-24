import BaseApi from './base.api';

export default class UserApi extends BaseApi {
  public getInfo = async (userId: string) => this.instance.get(`/user/info/${userId}`);

  public getAllInfo = async (options = {}) => this.instance.get('/user/info/', options);

  public getAllAccess = async () => this.instance.get('/user/access');

  public getUser = async (userId: string) => this.instance.get(`/user${userId}`);

  public deleteUser = async (userId: string) =>
    this.instance.delete('/user', { params: { _id: userId } });

  public updateUser = async (data: Object) => this.instance.post('/user', data);

  public getModeratorStats = async () => this.instance.get('/user/mod');

  public getAdminStats = async () => this.instance.get('/user/admin');
}
