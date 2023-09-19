export interface Application {
    id:          number;
    contract_no: number;
    user_id:     number;
    user_name:   string;
    loan:        number;
    year:        number;
    installment: number;
    status:      string;
    approved_by: ApprovedBy;
    created_on:  Date;
    updated_on:  null;
    deleted:     number;
}

export interface ApprovedBy {
    date:       Date;
    admin_id:   number;
    admin_name: string;
}