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
    const {id} = context.params
    try {
        const result = await axios.get(CONFIG.base_url_api + `/application/list?search=${(search || "")}&user_id=${id}`, {
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
            selector: (row: Application) => row?.contract_no
        },
        {
            name: "Total Pinjaman",
            right: false,
            selector: (row: Application) => formatToIDRCurrency(row?.loan)
        },
        {
            name: "Jangka Waktu",
            right: false,
            selector: (row: Application) => row?.year + ' tahun'
        },
        {
            name: "Cicilan",
            right: false,
            selector: (row: Application) => formatToIDRCurrency(row?.installment) + ' /bulan'
        },
        {
            name: "Status",
            right: false,
            selector: (row: Application) => row?.status == "rejected" ? "Tidak Lolos" : row?.status == "approved" ? "Lolos" : "Menunggu"
        },
        {
            name: "Aksi",
            right: false,
            selector: (row: Application) => <>
                {
                    (row?.status == 'waiting' || row?.status == 'rejected') &&
                    <>
                        <button>
                            <FaCheck className='text-blue-500 hover:text-blue-600 duration-300 transition text-[20px]' />
                        </button>
                        &nbsp;
                        &nbsp;
                    </>
                }
                {
                    (row?.status == 'waiting' || row?.status == 'rejected') &&
                    <>
                        <button>
                            <FaX className='text-red-500 hover:text-red-600 duration-300 transition text-[20px]' />
                        </button>
                        &nbsp;
                        &nbsp;
                    </>
                }
                <button onClick={() => {
                    router.push(`/main/debtor/detail/${row?.id}`)
                }}>
                    <RxDoubleArrowRight className='text-green-500 hover:green-blue-600 duration-300 transition text-[20px]' />
                </button>
            </>
        },
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
                <div className='flex justify-between'>
                    <h1 className='text-2xl font-bold'>Data Debitur {`>`} Pengajuan Pembiayaan</h1>
                    <div>
                        <Button color='primary' onClick={() => { router.push('/main/debtor/list') }} >Kembali</Button>
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
                                // onChangePage={(pageData) => {
                                //     router.push('?page=' + pageData)
                                // }}
                                // onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                                //     router.push(`?page=${currentPage}&size=${currentRowsPerPage}`)
                                // }}
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
