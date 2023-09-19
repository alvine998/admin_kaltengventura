export interface Payment {
    id:                   number;
    application_id:       number;
    application_contract: number;
    fee:                  number;
    due_date:             Date;
    payment_rate:         number;
    payment_fee:          number;
    payment_date:         null;
    total_payment:        number;
    bank_name:            null;
    account_number:       null;
    account_name:         null;
    photo:                null;
    status:               string;
    approved_by:          null;
    notes:                null;
    created_on:           Date;
    updated_on:           null;
    deleted:              number;
}