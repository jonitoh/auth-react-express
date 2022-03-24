export default class FakeApi {
  public instance: Object;

  public constructor(showLog: boolean) {
    this.instance = {};
  }

  public static async fakeApiCall(
    data: unknown,
    condition = (d: unknown) => true,
    successMsg = 'successful fake API call',
    errorMsg = 'error on the fake API call',
    timing = 3000
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (condition(data)) {
          console.info(successMsg);
          resolve();
        } else {
          console.error(errorMsg);
          reject();
        }
      }, timing);
    });
  }
}
