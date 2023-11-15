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
import Select from '@/components/Select'
import Swal from 'sweetalert2'
import { FaPencilAlt } from 'react-icons/fa'

export async function getServerSideProps(context: any) {
    const { search, page, size } = context.query;
    try {
        const result = await axios.get(CONFIG.base_url_api + `/debtor/list?search=${search || ""}&page=${page || 1}&size=${size}`, {
            headers: {
                "bearer-token": "kaltengventura2023"
            }
        })
        const users = await axios.get(CONFIG.base_url_api + `/user/list?from=admin`, {
            headers: {
                "bearer-token": "kaltengventura2023"
            }
        })
        return {
            props: {
                table: result.data || [],
                users: users?.data?.items
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export default function List({ table, users }: any) {
    const [info, setInfo] = useState<any>({ loading: false, message: "" })
    const [modal, setModal] = useModal<any>()
    const router = useRouter();
    const [show, setShow] = useState<boolean>(false)
    const [admin, setAdmin] = useState<any>()
    const USERS: any = users?.map((v: any) => { return { ...v, value: v?.id, label: v?.name?.toUpperCase() } })
    const [loans, setLoans] = useState<boolean>(false)
    const [images, setImages] = useState<any>({
        ktp: null,
        kk: null,
        partner_ktp: null
    })
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
            selector: (row: Debtor) => row.kk ? <a href={row.kk} target='_blank'><img src={row.kk} className='w-10' /></a> : "-"
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
                        <button onClick={() => {
                            setModal({ ...modal, open: true, data: row, key: "rejected" })
                        }}>
                            <FaX className='text-red-500 hover:text-red-600 duration-300 transition text-[20px]' />
                        </button>
                    </>
                }

                {
                    row?.status == 'approved' && users?.find((v: any) => v?.id == row?.user_id)?.from == "admin" &&
                    <button onClick={() => {
                        setModal({ ...modal, open: true, data: row, key: "update" })
                        setImages({
                            ktp: row?.ktp,
                            kk: row?.kk,
                            partner_ktp: row?.partner_ktp || null
                        })
                        setLoans(row?.other_loan == 1 ? true : false)
                    }}>
                        <FaPencilAlt className='text-blue-500 hover:text-blue-600 duration-300 transition text-[20px]' />
                    </button>
                }
                &nbsp;
                &nbsp;
                {
                    row?.status == 'approved' &&
                    <button onClick={() => {
                        router.push(`detail/${row?.user_id}`)
                        localStorage.setItem("from", JSON.stringify({ user_id: row?.user_id, user_name: row?.user_name, user_from: users?.find((v: any) => v?.id == row?.user_id)?.from }))
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
    const save = async (e: any) => {
        e.preventDefault();
        setInfo({ loading: true })
        const formData: any = Object.fromEntries(new FormData(e.target))
        try {
            const payload = {
                ...formData,
                status: 'approved',
                user_name: users?.find((v: any) => v?.id == formData?.user_id)?.name,
                approved_by: {
                    admin_id: formData?.admin_id,
                    admin_name: formData?.admin_name,
                    verificated_on: new Date().toISOString(),
                },
                ktp: images?.ktp,
                kk: images?.kk,
                partner_ktp: images?.partner_ktp
            }
            if (modal.key == "create") {
                const result = await axios.post(CONFIG.base_url_api + `/debtor`, payload, {
                    headers: { "bearer-token": 'kaltengventura2023' }
                })
            } else {
                const result = await axios.patch(CONFIG.base_url_api + `/debtor`, payload, {
                    headers: { "bearer-token": 'kaltengventura2023' }
                })
            }
            Swal.fire({ icon: "success", text: "Berhasil menyimpan data" })
            setModal({ ...modal, open: false })
            router.push("")
        } catch (error) {
            console.log(error);
            Swal.fire({ icon: "error", text: "Gagal menyimpan data" })
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
                <Button type='button' onClick={() => {
                    setModal({ ...modal, open: true, key: "create", data: null })
                    setImages({
                        ktp: null,
                        kk: null,
                        partner_ktp: null
                    })
                    setLoans(false)
                }}>Tambah Data</Button>
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
                                onChangePage={(pageData) => {
                                    router.push('?page=' + pageData)
                                }}
                                onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                                    router.push(`?page=${currentPage}&size=${currentRowsPerPage}`)
                                }}
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
                {
                    modal.key == "create" || modal.key == "update" ?
                        <>
                            <Modal
                                open={modal.open}
                                setOpen={() => setModal({ ...modal, open: false })}

                            >
                                <div>
                                    <h1 className='text-center font-bold text-lg'>{modal.key == 'create' ? "Tambah Data Debitur" : "Ubah Data Debitur"}</h1>
                                    <form onSubmit={save}>
                                        <input type="text" className='hidden' value={admin?.id} name='admin_id' />
                                        <input type="text" className='hidden' value={"approved"} name='status' />
                                        <input type="text" className='hidden' value={modal?.data?.id} name='id' />
                                        <input type="text" className='hidden' value={admin?.name} name='admin_name' />
                                        <Select label='Pengguna' required options={[{ value: "", label: "Pilih Pengguna" }, ...USERS]} defaultValue={modal?.data?.user_id || ""} name='user_id' />
                                        <Input label='Nama / Nama Usaha' placeholder='Masukkan Nama / Nama Usaha' name='name' required defaultValue={modal?.data?.name || ""} />
                                        <Input label='Alamat' placeholder='Masukkan Alamat' name='address' required defaultValue={modal?.data?.address || ""} />
                                        <div className='flex md:flex-row flex-col gap-2'>
                                            <Input label='Bidang Pekerjaan' placeholder='Masukkan Bidang Pekerjaan' name='field_type' required defaultValue={modal?.data?.field_type || ""} />
                                            <Input label='Status Tempat Tinggal' placeholder='Masukkan Status Tempat Tinggal' name='place_status' required defaultValue={modal?.data?.place_status || ""} />
                                        </div>
                                        <Input label='Nama Ibu Kandung' placeholder='Masukkan Nama Ibu Kandung' name='mother_name' required defaultValue={modal?.data?.mother_name || ""} />
                                        <div className='mt-2'>
                                            <label htmlFor="other_loan">Memiliki pinjaman lain?</label>
                                            <div className='flex gap-4'>
                                                <div className='flex gap-2'>
                                                    <input type="radio" id='other_loan' onChange={(e) => { setLoans(false) }} defaultChecked={modal?.data?.other_loan == '0' || true} name='other_loan' value={"0"} />
                                                    <span>Tidak</span>
                                                </div>
                                                <div className='flex gap-2'>
                                                    <input type="radio" id='other_loan' onChange={(e) => { setLoans(true) }} defaultChecked={modal?.data?.other_loan == '1'} name='other_loan' value={"1"} />
                                                    <span>Ya</span>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            loans &&
                                            <Input label='Nama Pinjaman' placeholder='Masukkan Nama Pinjaman' name='other_loan_name' required defaultValue={modal?.data?.other_loan_name || ""} />
                                        }

                                        <div className='flex md:flex-row flex-col gap-2 items-center my-2'>
                                            <Input label='KTP' name='ktp' required type='file' onChange={(e: any) => {
                                                const file = e.target.files[0]
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    const base64 = reader.result;
                                                    setImages({ ...images, ktp: base64 })
                                                }
                                                reader.readAsDataURL(file)
                                            }} />
                                            {
                                                images?.ktp &&
                                                <img src={images?.ktp} className='w-full md:h-[200px]' />
                                            }
                                        </div>
                                        <div className='flex md:flex-row flex-col gap-2 items-center my-2'>
                                            <Input label='Kartu Keluarga' name='kk' required type='file' onChange={(e: any) => {
                                                const file = e.target.files[0]
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    const base64 = reader.result;
                                                    setImages({ ...images, kk: base64 })
                                                }
                                                reader.readAsDataURL(file)
                                            }} />
                                            {
                                                images?.kk &&
                                                <img src={images?.kk} className='w-full md:h-[200px]' />
                                            }
                                        </div>
                                        <div className='flex md:flex-row flex-col gap-2 items-center my-2'>
                                            <Input label='KTP Suami / Istri' name='partner_ktp' type='file' onChange={(e: any) => {
                                                const file = e.target.files[0]
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    const base64 = reader.result;
                                                    setImages({ ...images, partner_ktp: base64 })
                                                }
                                                reader.readAsDataURL(file)
                                            }} />
                                            {
                                                images?.partner_ktp &&
                                                <img src={images?.partner_ktp} className='w-full md:h-[200px]' />
                                            }
                                        </div>
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
