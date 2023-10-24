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
import { RxDoubleArrowRight } from 'react-icons/rx'
import { FaCheck, FaPencil, FaTrash, FaX } from 'react-icons/fa6'

export async function getServerSideProps(context: any) {
    const { search, page, size } = context.query;
    try {
        const result = await axios.get(CONFIG.base_url_api + `/debtor/list?search=${search || ""}`, {
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

export default function list({ table }: any) {
    const [info, setInfo] = useState<any>({ loading: false, message: "" })
    const [modal, setModal] = useModal<any>()
    const router = useRouter();
    const [show, setShow] = useState<boolean>(false)
    const [admin, setAdmin] = useState<any>()
    const columns: any = [
        {
            name: "Nama",
            right: false,
            selector: (row: Debtor) => row?.name
        },
        {
            name: "Nama Ibu Kandung",
            right: false,
            selector: (row: Debtor) => row?.mother_name
        },
        {
            name: "Bidang",
            right: false,
            selector: (row: Debtor) => row?.field_type
        },
        {
            name: "Status Tempat Tinggal",
            right: false,
            selector: (row: Debtor) => row?.place_status
        },
        {
            name: "Pinjaman Lain",
            right: false,
            selector: (row: Debtor) => row?.other_loan_name || "-"
        },
        {
            name: "KK",
            right: false,
            selector: (row: Debtor) => row.kk ? <a href={row.ktp} target='_blank'><img src={row.kk} className='w-10' /></a> : "-"
        },
        {
            name: "KTP",
            right: false,
            selector: (row: Debtor) => row.ktp ? <a href={row.ktp} target='_blank'><img src={row.ktp} className='w-10' /></a> : "-"
        },
        {
            name: "KTP Suami/Istri",
            right: false,
            selector: (row: Debtor) => row.partner_ktp ? <a href={row.partner_ktp} target='_blank'><img src={row.partner_ktp} className='w-10' /></a> : "-"
        },
        {
            name: "Status",
            right: false,
            selector: (row: Debtor) => row?.status
        },
        {
            name: "Aksi",
            right: false,
            selector: (row: Debtor) => <>
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
                    row?.status == 'approved' &&
                    <button onClick={() => {
                        router.push(`detail/${row?.user_id}`)
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
                approved_by: {
                    admin_id: formData?.admin_id,
                    admin_name: formData?.admin_name,
                    verificated_on: new Date().toISOString(),
                }
            }
            const result = await axios.patch(CONFIG.base_url_api + `/debtor`, payload, {
                headers: { "bearer-token": 'kaltengventura2023' }
            })
            setInfo({ loading: false, message: "Berhasil verifikasi", type: "success" })
            setModal({ ...modal, open: false })
            router.push("")
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
                <h1 className='text-2xl font-semibold'>Data Debitur</h1>
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
                                expandableRows
                                expandableRowsComponent={ExpandedComponent}
                                // onChangePage={(pageData) => {
                                //     router.push('?page=' + pageData)
                                // }}
                                // onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                                //     router.push(`?page=${currentPage}&size=${currentRowsPerPage}`)
                                // }}
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
                                        <input type="text" className='hidden' value={admin?.id} name='admin_id' />
                                        <input type="text" className='hidden' value={admin?.name} name='admin_name' />
                                        <p className='text-center'>Apakah anda yakin ingin {modal.key == "approved" ? `menyetujui ${modal.data.name}` : `menolak ${modal.data.name}`}?</p>
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
