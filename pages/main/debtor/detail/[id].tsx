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
    const { id } = context.params
    try {
        const result = await axios.get(CONFIG.base_url_api + `/application/list?search=${(search || "")}&user_id=${id}`, {
            headers: {
                "bearer-token": "kaltengventura2023"
            }
        })
        return {
            props: {
                table: result.data || [],
                params: {
                    id: id
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export default function List({ table, params }: any) {
    const [info, setInfo] = useState<any>({ loading: false, message: "" })
    const [modal, setModal] = useModal<any>()
    const router = useRouter();
    const [show, setShow] = useState<boolean>(false)
    const [admin, setAdmin] = useState<any>()
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
                    (row?.status == 'waiting') &&
                    <>
                        <button onClick={() => {
                            setModal({ ...modal, open: true, data: row, key: "approved" })
                        }}>
                            <FaCheck className='text-blue-500 hover:text-blue-600 duration-300 transition text-[20px]' />
                        </button>
                        &nbsp;
                        &nbsp;
                    </>
                }
                {
                    (row?.status == 'waiting') &&
                    <>
                        <button onClick={() => {
                            setModal({ ...modal, open: true, data: row, key: "rejected" })
                        }}>
                            <FaX className='text-red-500 hover:text-red-600 duration-300 transition text-[20px]' />
                        </button>
                        &nbsp;
                        &nbsp;
                    </>
                }
                {
                    (row?.status == 'approved') &&
                    <button onClick={() => {
                        router.push(`/main/debtor/detail/${params.id}/payment/${row?.id}`)
                    }}>
                        <RxDoubleArrowRight className='text-green-500 hover:green-blue-600 duration-300 transition text-[20px]' />
                    </button>
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

    useEffect(() => {
        if (info.type) {
            setTimeout(() => {
                setInfo({ ...info, type: "", message: "" })
            }, 3000);
        }
    }, [info])

    const handleVerification = async (e: any) => {
        e.preventDefault();
        setInfo({ loading: true })
        const formData: any = Object.fromEntries(new FormData(e.target))
        try {
            const payload = {
                ...formData,
                status: modal.key,
                id: modal.data.id,
                admin: {
                    id: formData?.admin_id,
                    name: formData?.admin_name,
                    date: new Date().toISOString(),
                }
            }
            const result = await axios.post(CONFIG.base_url_api + `/application/approval`, payload, {
                headers: { "bearer-token": 'kaltengventura2023' }
            })
            setInfo({ loading: false, message: "Berhasil verifikasi", type: "success" })
            setModal({ ...modal, open: false })
            router.push("/main/debtor/detail/" + params.id)
        } catch (error) {
            console.log(error);
            setInfo({ loading: false, message: "Gagal verifikasi", type: "error" })
        }
    }
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
                {
                    info.type ?
                        <>
                            <div className={`w-full p-2 rounded-lg ${info.type == "success" ? "bg-green-500" : "bg-red-500"}`} >
                                <p className='text-white' >{info.message}</p>
                            </div>
                        </> : ""
                }
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
                {
                    modal.key == "approved" || modal.key == "rejected" ?
                        <>
                            <Modal
                                open={modal.open}
                                setOpen={() => setModal({ ...modal, open: false })}

                            >
                                <div>
                                    <h1 className='text-center font-bold text-lg'>Verifikasi Data Debitur</h1>
                                    <form onSubmit={handleVerification}>
                                        <p className='text-center'>Apakah anda yakin ingin {modal.key == "approved" ? `menyetujui ${modal.data.user_name}` : `menolak ${modal.data.user_name}`}?</p>
                                        <div className='my-4'>
                                            <Button type='submit' disabled={info.loading}>{modal.key == 'approved' ? (info.loading ? "Menyetujui..." : "Setujui") : (info.loading ? "Menolak..." : "Tolak")}</Button>
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
