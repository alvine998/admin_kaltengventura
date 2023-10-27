export interface Payment {
    id:                   number;
    application_id:       number;
    application_contract: number;
    fee:                  number;
    due_date:             string;
    payment_rate:         number;
    payment_fee:          number;
    payment_date:         null;
    total_payment:        number;
    remaining_payment:    string;
    payment_no:           string;
    bank_name:            null;
    account_number:       null;
    account_name:         null;
    photo:                null;
    status:               string;
    approved_by:          Approved;
    notes:                null;
    created_on:           Date;
    updated_on:           null;
    deleted:              number;
}

export interface Approved {
    admin_id: number;
    admin_name: string;
    date: string,
    from: string;
}