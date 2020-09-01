import React from 'react';
import { CustomerNotesData } from '../data/customerNotesData';
import { Customer } from '../../../domain/customer';
import { CustomerList } from './customerList';
import { NoteList } from './noteList';
import './customerNotes.less';
import { CustomerNote } from '../../../domain/customerNote';
import { XExt } from '../../../jsh-core/xExt';

export class CustomerNotes extends React.Component<Props, State> {

    private _customerNotesData: CustomerNotesData;
    private _isMounted: boolean = false;
    private _loadingNotesForCustomerId: number | undefined;

    public constructor(props: Props) {
        super(props);
        this.state = {
            loadingCustomers: true
        };
        this._customerNotesData = props.customerNotesData;
    }

    public componentDidMount(): void {
        this.loadCustomerList();
        this._isMounted = true;
    }

    public componentWillUnmount(): void {
        this._isMounted = false;
    }

    public render(): React.ReactNode {

        const renderNoteList = (this.state.customers ?? []).length > 0 &&
            this.state.selectedCustomerId != undefined;

        const noteList = !renderNoteList ? undefined : (
            <NoteList customerId={this.state.selectedCustomerId}
                      addNewNote={(newNote, customerId) => this.onNoteAdded(newNote, customerId)}
                      xExt={this.props.xExt}
                      loadingNotes={this.state.loadingNotes === true}
                      notes={this.state.notes}
                      notesUpdated={notes => this.onNotesUpdated(notes)}
                      customerNotesData={this._customerNotesData}></NoteList>
        );

        return (
            <div className="CustomerNotesComponent default-theme">
                <div className="wrapper">
                    <div className="customerListWrapper">
                        <CustomerList customers={this.state.customers}
                                    selectedCustomerId={this.state.selectedCustomerId}
                                    onSelectCustomer={e => this.onSelectCustomer(e)}></CustomerList>
                    </div>
                    <div className="notesListWrapper">
                        {noteList}
                    </div>
                </div>
            </div>
        );
    }

    private async loadCustomerList(): Promise<void> {

        this.setState({ loadingCustomers: true });

        let customers: Customer[];
        try {
            customers = await this._customerNotesData.getCustomers();
            customers = customers ?? [];
        } catch (error) {
            // TODO: handle error
            customers = [];
        }

        if (!this._isMounted) return;

        this.setState({
            customers,
            loadingCustomers: false
        });
    }

    private onNoteAdded(note: CustomerNote, customerId: number): void {
        if (this.state.selectedCustomerId !== customerId) {
            return;
        }

        const notes = [...(this.state.notes ?? [])];
        notes.push(note);
        this.setState({ notes });
    }

    private onNotesUpdated(notes: CustomerNote[]): void {
        this.setState({ notes });
    }

    private async onSelectCustomer(customer?: Customer): Promise<void> {

        this._loadingNotesForCustomerId = customer?.cust_id;
        this.setState({
            loadingNotes: false,
            notes: undefined,
            selectedCustomerId: customer?.cust_id
        });

        if (customer == undefined) {
            return;
        }

        this.setState({ loadingNotes: true });
        let notes: CustomerNote[];
        try {
            notes = await this._customerNotesData.getNotes({ customerId: customer.cust_id });
            notes = notes ?? [];
        } catch (error) {
            // TODO: handle error
            notes = [];
        }

        if (!this._isMounted) return;

        // Ignore the value if another item
        // was selected while waiting for data.
        if (this._loadingNotesForCustomerId !== customer.cust_id) {
            return;
        }

        notes.sort((a, b) => a.note_etstmp >= b.note_etstmp ? 1 : -1);
        this.setState({
            loadingNotes: false,
            notes
        });
    }
}

export interface Props {
    customerNotesData: CustomerNotesData;
    xExt: XExt;
}

export interface State {
    customers?: Customer[];
    loadingCustomers?: boolean;
    loadingNotes?: boolean;
    notes?: CustomerNote[];
    selectedCustomerId?: number;
}

