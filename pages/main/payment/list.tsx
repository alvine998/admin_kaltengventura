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

export async function getServerSideProps(context: any) {
    const { search, page, size } = context.query;
    try {
        const result = await axios.get(CONFIG.base_url_api + `/payment/list?search=${(search || "")}&page=${page || 1}&size=${size}&status=paid`, {
            headers: {
                "bearer-token": "kaltengventura2023"
            }
        })
        return {
            props: {
                table: result.data || []
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export default function list({ table }: { table: any }) {
    const [info, setInfo] = useState<any>({ loading: false, message: "" })
    const [modal, setModal] = useModal<any>()
    const router = useRouter();
    const [show, setShow] = useState<boolean>(false)
    const columns: any = [
        {
            name: "No Kontrak",
            right: false,
            selector: (row: Payment) => row?.application_contract
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
            name: "Pembayaran",
            right: false,
            selector: (row: Payment) => formatToIDRCurrency(row?.payment_fee)
        },
        {
            name: "Tanggal Pembayaran",
            right: false,
            selector: (row: Payment) => row?.payment_date || "-"
        },
        {
            name: "Foto",
            right: false,
            selector: (row: Payment) => row.photo ? <img src={row.photo} className='w-10 h-6' /> : "-"
        },
        {
            name: "Status",
            right: false,
            selector: (row: Payment) => row?.status == "unpaid" ? "Belum Lunas" : row?.status == "paid" ? "Lunas" : "Pending"
        },
        // {
        //     name: "Aksi",
        //     right: false,
        //     selector: (row: Payment) => <>
        //         <button className='text-green-500'>
        //             Terima
        //         </button>
        //         &nbsp;
        //         <button className='text-red-500'>
        //             Tolak
        //         </button>
        //     </>
        // },
    ]

    useEffect(() => {
        if (typeof window !== undefined) {
            setShow(!show)
        }
    }, [])

    // const handleCreate = async (e: any) => {
    //     e.preventDefault();
    //     const formData: any = Object.fromEntries(new FormData(e.target))
    //     try {
    //         const result = await createUserWithEmailAndPassword(auth, formData?.email, formData?.password)
    //         console.log(result);
    //         router.push("/main/user/list")
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    const ExpandedComponent: React.FC<ExpanderComponentProps<any>> = ({ data }) => {
        return (
            <div className='sm:p-5 sm:pl-16'>
                <div className='flex justify-start gap-5'>
                    <p>Nama : </p>
                    <p>{data?.name}</p>
                </div>
                <div className='flex justify-start gap-5'>
                    <p>Alamat : </p>
                    <p>{data?.address}</p>
                </div>
            </div>
        )
    }
    return (
        <Layout>
            <div className='p-2'>
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
                                    router.push('?page=' + pageData)
                                }}
                                onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                                    router.push(`?page=${currentPage}&size=${currentRowsPerPage}`)
                                }}
                                // expandableRows
                                // expandableRowsComponent={ExpandedComponent}
                                responsive={true}
                                highlightOnHover
                                pointerOnHover
                            /> : ""
                    }
                </div>
                {/* {
                    modal.key == "create" ?
                        <>
                            <Modal
                                open={modal.open}
                                setOpen={() => setModal({ ...modal, open: false })}

                            >
                                <div>
                                    <h1 className='text-center font-bold text-lg'>{modal.key == "create" ? "Tambah Data Admin" : "Ubah Data Admin"}</h1>
                                    <form onSubmit={handleCreate}>
                                        <Input label='Email' placeholder='Masukkan Email' name='email' />
                                        <Input label='Password' type='password' placeholder='********' name='password' />
                                        <div className='my-4'>
                                            <Button type='submit'>Simpan</Button>
                                            <Button type='button' color='white' onClick={() => { setModal({ ...modal, open: false }) }} >Tutup</Button>
                                        </div>
                                    </form>
                                </div>
                            </Modal>
                        </> : ""
                } */}
            </div>
        </Layout>
    )
}
