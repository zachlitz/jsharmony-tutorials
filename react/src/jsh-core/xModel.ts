export class XModel {

    public get id(): string {return this._xModel.id; }
    public get namespace(): string { return this._xModel.namespace; }

    private _xModel: any;

    public constructor(xModel: any) {
        this._xModel = xModel;
    }
}