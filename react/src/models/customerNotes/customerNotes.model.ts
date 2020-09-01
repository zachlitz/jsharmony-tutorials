import { JshModel, JshModelDependencies } from '../../jsh-core/jshModel';
import { CustomerNotesData } from './data/customerNotesData';
import { CustomerNotes } from './components/customerNotes';

export default class CustomerNotesModel extends JshModel {

    private readonly _customerNotesData: CustomerNotesData;


    public constructor(dependencies: JshModelDependencies) {
        super(dependencies);
        this._customerNotesData = new CustomerNotesData(this.XForm);
    }

    public onDestroy(): void {
        this.unmount();
    }

    public onInit(): void {
        this.render(CustomerNotes, { customerNotesData: this._customerNotesData, xExt: this.XExt });
    }
}
