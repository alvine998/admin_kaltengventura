import Button from '@/components/Button'
import Layout from '@/components/Layout'
import React, { useState, useEffect } from 'react'
import DataTable, { ExpanderComponentProps } from 'react-data-table-component'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { useRouter } from 'next/router'
import useModal, { Modal } from '@/components/Modal'
import axios from 'axios'
import Input from '@/components/Input'
import { CONFIG } from '@/config'
import { Debtor } from '@/types/debtor'
import { Payment } from '@/types/payment'
import { formatDateToIndonesian, formatToIDRCurrency } from '@/utils'
import { Application } from '@/types/application'
import { FaCheck, FaX } from 'react-icons/fa6'
import { RxDoubleArrowRight } from 'react-icons/rx'

export async function getServerSideProps(context: any) {
    const { search, page, size } = context.query;
    const { pay_id, id } = context.params
    try {
        const result = await axios.get(CONFIG.base_url_api + `/payment/list?search=${(search || "")}&application_id=${pay_id || ""}&page=${page || 1}&size=${size || 10}`, {
            headers: {
                "bearer-token": "kaltengventura2023"
            }
        })
        return {
            props: {
                table: result.data || [],
                params: {
                    id: id,
                    pay_id: pay_id
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export default function list({ table, params }: any) {
    const [info, setInfo] = useState<any>({ loading: false, message: "" })
    const [modal, setModal] = useModal<any>()
    const router = useRouter();
    const [show, setShow] = useState<boolean>(false)
    const [admin, setAdmin] = useState<any>()

    const columns: any = [
        {
            name: "No Kontrak",
            right: false,
            selector: (row: Payment) => row?.application_contract
        },
        {
            name: "Tagihan Ke",
            right: false,
            selector: (row: Payment) => row?.payment_no
        },
        {
            name: "Tanggal Ditagihkan",
            right: false,
            selector: (row: Payment) => row?.due_date
        },
        {
            name: "Total Tagihan",
            right: false,
            selector: (row: Payment) => formatToIDRCurrency(row?.total_payment)
        },
        {
            name: "Tanggal Pembayaran",
            right: false,
            selector: (row: Payment) => row?.payment_date ? formatDateToIndonesian(row?.payment_date) : "-"
        },
        {
            name: "Bank",
            right: false,
            selector: (row: Payment) => <div>
                <p className='text-xs'>
                    {row?.bank_name}<br />
                    {row?.account_name}<br />
                    <strong>{row?.account_number}</strong>
                </p>
            </div>
        },
        {
            name: "Status",
            right: false,
            selector: (row: Payment) => row?.status == "paid" ? "Lunas" : row?.status == "unpaid" ? "Belum Lunas" : "Pending"
        },
        {
            name: "Aksi",
            right: false,
            selector: (row: Payment) => <>
                {
                    (row?.status == 'pending') ?
                        <>
                            <button onClick={() => {
                                setModal({ ...modal, open: true, data: row, key: "view" })
                            }}>
                                <FaCheck className='text-blue-500 hover:text-blue-600 duration-300 transition text-[20px]' />
                            </button>
                        </> : "-"
                }
            </>
        },
    ]
    const getAdmin = async () => {
        const result = await localStorage.getItem("uid")
        setAdmin(JSON.parse(result!))
    }

    useEffect(() => {
        if (typeof window !== undefined) {
            setShow(!show)
        }
        getAdmin()
    }, [])

    const ExpandedComponent: React.FC<ExpanderComponentProps<any>> = ({ data }) => {
        return (
            <div className='sm:p-5 sm:pl-16'>
                <div className='flex justify-start gap-5'>
                    <p>Keterangan : </p>
                    <p>{data?.notes || "-"}</p>
                </div>
                <div className='flex justify-start gap-5'>
                    <p>Bank : </p>
                    <p>
                        {data?.bank_name}<br />
                        {data?.account_name}<br />
                        <strong>{data?.account_number}</strong><br />
                    </p>
                </div>
            </div>
        )
    }

    const handleVerification = async (e: any) => {
        e.preventDefault();
        setInfo({ loading: true })
        const formData: any = Object.fromEntries(new FormData(e.target))
        try {
            const payload = {
                ...formData,
                status: 'paid',
                id: modal.data.id,
                approved_by: {
                    admin_id: formData?.admin_id,
                    admin_name: formData?.admin_name,
                    verificated_on: new Date().toISOString(),
                },
                payment_fee: modal.data.fee,
                payment_date: new Date().toISOString()
            }
            const result = await axios.patch(CONFIG.base_url_api + `/payment`, payload, {
                headers: { "bearer-token": 'kaltengventura2023' }
            })
            setInfo({ loading: false, message: "Berhasil verifikasi", type: "success" })
            setModal({ ...modal, open: false })
            router.push("/main/debtor/detail/" + params.id + "/payment/" + params.pay_id)
        } catch (error) {
            console.log(error);
            setInfo({ loading: false, message: "Gagal verifikasi", type: "error" })
        }
    }

    return (
        <Layout>
            <div className='p-2'>
                <div className='flex justify-between'>
                    <h1 className='text-2xl font-bold'>Data Debitur {`>`} Pengajuan Pembiayaan {`>`} Detail Tagihan</h1>
                    <div>
                        <Button color='primary' onClick={() => { router.push(`/main/debtor/detail/${params?.id}`) }} >Kembali</Button>
                    </div>
                </div>
                <Input label='' placeholder='Cari Disini...' onChange={(e) => {
                    router.push(`?search=${e.target.value}`)
                }} />
                <div>
                    {
                        show ?
                            <DataTable
                                columns={columns}
                                data={table.items}
                                paginationTotalRows={table.total_items}
                                pagination={true}
                                paginationServer={true}
                                paginationDefaultPage={1}
                                striped={true}
                                onChangePage={(pageData) => {
                                    router.push(`/main/debtor/detail/${params.id}/payment/${params.pay_id}?page=` + pageData)
                                }}
                                onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                                    router.push(`/main/debtor/detail/${params.id}/payment/${params.pay_id}?page=${currentPage}&size=${currentRowsPerPage}`)
                                }}
                                expandableRows
                                expandableRowsComponent={ExpandedComponent}
                                responsive={true}
                                highlightOnHover
                                pointerOnHover
                            /> : ""
                    }
                </div>
                {
                    modal.key == "view" ?
                        <>
                            <Modal
                                open={modal.open}
                                setOpen={() => setModal({ ...modal, open: false })}

                            >
                                <div>
                                    <h1 className='text-center font-bold text-lg'>{"Verifikasi Pembayaran"}</h1>
                                    <form onSubmit={handleVerification}>
                                        <input type="text" className='hidden' value={admin?.id} name='admin_id' />
                                        <input type="text" className='hidden' value={admin?.name} name='admin_name' />
                                        {
                                            modal.data.photo ?
                                                <>
                                                    <img src={modal.data.photo} className='w-full h-[300px]' alt='bukti-bayar' />
                                                </> : <p className='text-center my-5'>Tidak ada bukti upload</p>
                                        }
                                        <Input label='Nama Bank' placeholder='Masukkan Nama Bank' name='bank_name' required />
                                        <Input label='Nama Pemilik Rekening' placeholder='Masukkan Nama Pemilik Rekening' name='account_name' required />
                                        <Input label='No Rekening' type='number' placeholder='Masukkan No Rekening' name='account_number' required />
                                        <div className='my-4'>
                                            <Button type='submit' disabled={info.loading}>{info.loading ? "Menyimpan..." : "Simpan"}</Button>
                                            <Button type='button' color='white' onClick={() => { setModal({ ...modal, open: false }) }} >Tutup</Button>
                                        </div>
                                    </form>
                                </div>
                            </Modal>
                        </> : ""
                }
            </div>
        </Layout>
    )
}
