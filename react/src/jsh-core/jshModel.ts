import ReactDOM from 'react-dom';
import React from 'react';
import { XForm } from './xForm';
import { XModel } from './xModel';
import { XExt } from './xExt';


export abstract class JshModel {

    protected readonly XExt: XExt;
    protected readonly XForm: XForm;
    protected get modelId(): string { return this.xModel.id; };
    protected readonly xModel: XModel;

    public constructor(dependencies: JshModelDependencies) {
        this.XExt = new XExt(dependencies.xExt);
        this.XForm = new XForm(dependencies.xForm);
        this.xModel = new XModel(dependencies.xModel);
    }

    protected render<TProps>(component: React.ComponentClass<TProps>, props: TProps): void {
        ReactDOM.render(React.createElement(component, props), document.querySelector(this.getRootSelector()));
    }

    protected unmount(): void {
        const root = document.querySelector(this.getRootSelector());
        if (root != undefined) {
            ReactDOM.unmountComponentAtNode(root);
        }
    }

    private getRootSelector(): string {
        return `.xformcontainer.xelem${this.modelId}`;
    }
}

export type JshModelDependencies = {
    xExt: any;
    xForm: any;
    xModel: any;
};