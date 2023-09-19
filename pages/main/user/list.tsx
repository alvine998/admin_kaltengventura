import Button from '@/components/Button'
import Layout from '@/components/Layout'
import React, { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { useRouter } from 'next/router'
import useModal, { Modal } from '@/components/Modal'
import axios from 'axios'
import Input from '@/components/Input'
import { CONFIG } from '@/config'
import { User } from '@/types/user'

export async function getServerSideProps(context: any) {
    const { search } = context.query;
    try {
        const result = await axios.get(CONFIG.base_url_api + '/user/list?search=' + (search || ""), {
            headers: {
                "bearer-token": "kaltengventura2023"
            }
        })
        return {
            props: {
                table: result.data.items || []
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
            name: "Nama",
            right: false,
            selector: (row: User) => row?.name
        },
        {
            name: "Email",
            right: false,
            selector: (row: User) => row?.email
        },
        {
            name: "No HP",
            right: false,
            selector: (row: User) => row?.phone
        },
        {
            name: "Foto",
            right: false,
            selector: (row: User) => row.photo ? <img src={row.photo} className='w-6 h-10' /> : "-"
        },
        {
            name: "Status",
            right: false,
            selector: (row: User) => row?.status
        },
        {
            name: "Aksi",
            right: false,
            selector: (row: User) => <>
                <button className='text-green-500 text-xs'>
                    Edit
                </button>
                &nbsp;
                &nbsp;
                <button className='text-red-500 text-xs'>
                    Hapus
                </button>
            </>
        },
    ]

    useEffect(() => {
        if (typeof window !== undefined) {
            setShow(!show)
        }
    }, [])

    const handleCreate = async (e: any) => {
        e.preventDefault();
        const formData: any = Object.fromEntries(new FormData(e.target))
        try {
            const payloada = {
                ...formData
            }
            console.log(payloada);
            router.push("/main/user/list")
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <Layout>
            <div className='p-2'>
                <Input label='' placeholder='Cari Disini...' onChange={(e) => {
                    router.push(`?search=${e.target.value}`)
                }} />
                <Button type='button' onClick={() => {
                    setModal({ ...modal, open: true, key: "create", data: null })
                }}>Tambah Data</Button>
                <div>
                    {
                        show ?
                            <DataTable
                                columns={columns}
                                data={table}
                                paginationTotalRows={table.length}
                                pagination={true}
                                paginationServer={true}
                                paginationDefaultPage={1}
                                striped={true}
                                responsive={true}
                                highlightOnHover
                                pointerOnHover
                            /> : ""
                    }
                </div>
                {
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
                }
            </div>
        </Layout>
    )
}
