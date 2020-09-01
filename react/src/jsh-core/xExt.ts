export class XExt {

    private readonly _xExt: any;

    public constructor(xExt: any ) {
        this._xExt = xExt;
    }

    public confirm(obj: object, onYes: () => void, onNo: () => void, options: XExtConfirmOptions | undefined): void;
    public confirm(message: string, onYes: () => void, onNo: () => void, options: XExtConfirmOptions | undefined): void;
    public confirm(obj: any, onYes: () => void, onNo: () => void, options: XExtConfirmOptions | undefined): void {
        this._xExt.Confirm(obj, onYes, onNo, options);
    }
}

export interface XExtConfirmOptions {
    button_cancel_caption?: string;
    button_no_caption?: string;
    button_ok_caption?: string;
    message_type?: 'text' | 'html';
    onCancel?: () => void;
}