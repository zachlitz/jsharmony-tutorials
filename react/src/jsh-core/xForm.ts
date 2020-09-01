export class XForm {

    private readonly _xForm: any;

    public constructor(xForm: any) {
        this._xForm = xForm;
    }

    public async XExecutePost(endpoint: string, data: object | undefined): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this._xForm.prototype.XExecutePost(endpoint, data, (result: any) => {
                resolve(result);
            }, (error: any) => {
                reject(error);
            });
        });
    }

    public async reqDelete(url: string, q: object | undefined, d: object | undefined, options: object | undefined): Promise<any> {
        return new Promise((resolve, reject) => {
            this._xForm.prototype.reqDelete(url, q, d, (result: any) => {;
                resolve(result);
            }, (error: any) => {
                reject(error);
            },options);
        });
    }

    public async reqGet(url: string, q: object | undefined, d: object | undefined, options: object | undefined): Promise<any> {
        return new Promise((resolve, reject) => {
            this._xForm.prototype.reqGet(url, q, d, (result: any) => {;
                resolve(result);
            }, (error: any) => {
                reject(error);
            },options);
        });
    }

    public async reqPost(url: string, q: object | undefined, d: object | undefined, options: object | undefined): Promise<any> {
        return new Promise((resolve, reject) => {
            this._xForm.prototype.reqPost(url, q, d, (result: any) => {;
                resolve(result);
            }, (error: any) => {
                reject(error);
            },options);
        });
    }

    public async reqPut(url: string, q: object | undefined, d: object | undefined, options: object | undefined): Promise<any> {
        return new Promise((resolve, reject) => {
            this._xForm.prototype.reqPut(url, q, d, (result: any) => {;
                resolve(result);
            }, (error: any) => {
                reject(error);
            },options);
        });
    }
}