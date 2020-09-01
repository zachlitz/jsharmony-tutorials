import { Customer } from '../../../domain/customer';
import React from 'react';
import './customerList.less';

export class CustomerList extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {}
    }

    public render(): React.ReactNode {
        const customers = this.props.customers ?? [];
        return (
            <div className="CustomerListComponent">
                <div className="listWrapper">
                    {customers.map(c => this.mapCustomer(c))}
                </div>
            </div>
        );
    }

    public clickIt(customer?: Customer): void {
        this.props.onSelectCustomer?.(customer);
    }

    private mapCustomer(customer: Customer): React.ReactNode {
        const isSelected = customer.cust_id === this.props.selectedCustomerId;
        const classes: string[] = [
            'customerItem'
        ];
        if (isSelected) {
            classes.push('selected');
        }

        return (
            <div className={classes.join(' ')}
                 onClick={() => this.clickIt(customer)}
                 key={customer.cust_id}>
                {customer.cust_name}
            </div>
        );
    }
}

export interface Props {
    customers: Customer[] | undefined;
    onSelectCustomer: (customer?: Customer) => void;
    selectedCustomerId?: number;
}

export interface State {

}