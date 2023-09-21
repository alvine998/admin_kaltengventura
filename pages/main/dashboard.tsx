import Button from '@/components/Button'
import Layout from '@/components/Layout'
import React, { useState } from 'react'
import DataTable from 'react-data-table-component'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { useRouter } from 'next/router'
import useModal, { Modal } from '@/components/Modal'
import Input from '@/components/Input'
import { getData, updateData } from '@/pages/api/member'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import axios from 'axios'
import { CONFIG } from '@/config'
import { formatToIDRCurrency } from '@/utils'
import { FaMoneyBillTrendUp, FaMoneyBillTransfer, FaMoneyBillWave, FaUserGroup, FaUsers } from 'react-icons/fa6'

export async function getServerSideProps(context: any) {
    try {
        const result = await axios.get(CONFIG.base_url_api + `/payment/list?size=1000`, {
            headers: {
                "bearer-token": "kaltengventura2023"
            }
        })
        const result2 = await axios.get(CONFIG.base_url_api + `/debtor/list`, {
            headers: {
                "bearer-token": "kaltengventura2023"
            }
        })
        const result3 = await axios.get(CONFIG.base_url_api + `/user/list`, {
            headers: {
                "bearer-token": "kaltengventura2023"
            }
        })
        let count_payment = result.data.items?.reduce((a: any, b: any) => a = a + b.fee, 0)
        let count_payment_fee = result.data.items?.filter((v: any) => v?.status == 'paid')?.reduce((a: any, b: any) => a = a + b.payment_fee, 0)
        let total_debtors = result2.data.total_items
        let total_users = result3.data.total_items

        return {
            props: {
                count_payment: count_payment,
                count_payment_fee: count_payment_fee,
                total_debtors: total_debtors,
                total_users: total_users
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export default function list({ count_payment, count_payment_fee, total_debtors, total_users }: any) {
    const [info, setInfo] = useState<any>({ loading: false, message: "" })
    const [modal, setModal] = useModal<any>()
    const router = useRouter();
    return (
        <Layout>
            <div className='p-2'>
                <div className='bg-green-200 w-full p-10'>
                    <h1 className='text-lg text-green-800'>Selamat Datang di Dashboard Admin KaltengVentura</h1>
                </div>
                <div className='flex gap-2'>
                    <div className='bg-green-200 w-1/4 p-10 mt-10'>
                        <FaMoneyBillWave className={'text-2xl text-green-800'} />
                        <h1 className='text-lg text-green-800'>Total Dana Keluar : {formatToIDRCurrency(count_payment)}</h1>
                    </div>
                    <div className='bg-green-200 w-1/4 p-10 mt-10'>
                        <FaMoneyBillTrendUp className={'text-2xl text-green-800'} />
                        <h1 className='text-lg text-green-800'>Total Dana Masuk : {formatToIDRCurrency(count_payment_fee)}</h1>
                    </div>
                    <div className={count_payment_fee > count_payment ? 'bg-green-200 w-1/4 p-10 mt-10' : 'bg-red-200 w-1/4 p-10 mt-10'}>
                        <FaMoneyBillTransfer className={count_payment_fee > count_payment ? 'text-2xl text-green-800' : 'text-2xl text-red-800'} />
                        <h1 className={count_payment_fee > count_payment ? 'text-lg text-green-800' : 'text-lg text-red-800'}>Selisih Total Dana : {formatToIDRCurrency(count_payment_fee - count_payment)}</h1>
                    </div>
                    <div className='bg-green-200 w-1/4 p-10 mt-10'>
                        <FaUserGroup className={'text-2xl text-green-800'} />
                        <h1 className='text-lg text-green-800'>Total Debitur : {total_debtors}</h1>
                    </div>
                </div>
                <div>
                    <div className='bg-green-200 w-1/4 p-10 mt-10'>
                        <FaUsers className={'text-2xl text-green-800'} />
                        <h1 className='text-lg text-green-800'>Total Pengguna : {total_users}</h1>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
