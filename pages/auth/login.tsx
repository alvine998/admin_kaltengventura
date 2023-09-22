import Button from '@/components/Button'
import Input from '@/components/Input'
import React, { useState } from 'react'
import { login } from '../api/member'
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'
import axios from 'axios'
import { CONFIG } from '@/config'

export default function Login() {
    const [info, setInfo] = useState<any>({ loading: false, message: "", type: null })
    const router = useRouter()

    const handleLogin = async (e: any) => {
        e.preventDefault();
        setInfo({ loading: true })
        try {
            const formData: any = Object.fromEntries(new FormData(e.target))
            if (!formData?.email?.includes('@kaltengventura')) {
                Swal.fire({
                    text: "Email tidak terdaftar",
                    icon: "warning"
                })
                setInfo({ loading: false })
                return
            }
            const payload = {
                ...formData
            }
            const result = await axios.post(CONFIG.base_url_api + '/user/login', payload, {
                headers: { 'bearer-token': 'kaltengventura2023' }
            })
            const x = result.data.result
            await localStorage.setItem("uid", JSON.stringify({
                id: x?.id,
                name: x?.name,
                email: x?.email,
                phone: x?.phone
            }))
            router.push('/main/dashboard')
            setInfo({ loading: false, message: "Berhasil Login" })
        } catch (error) {
            console.log(error);
            Swal.fire({
                text: "Login Gagal",
                icon: "error"
            })
            setInfo({ loading: false, message: "Gagal Login" })
        }
    }
    return (
        <div className='flex flex-col py-20 px-10'>
            <h1 className='text-2xl font-semibold text-center'>ADMIN KALTENGVENTURA</h1>
            <form onSubmit={handleLogin} className='mt-5 sm:px-[500px]'>
                <Input label='Email' required placeholder='Masukkan Email' type='email' name='email' />
                <Input label='Password' required placeholder='********' type='password' name='password' />
                <div className='mt-5'>
                    <Button disabled={info.loading}>{info.loading ? "Menunggu..." : "Masuk"}</Button>
                </div>
            </form>
        </div>
    )
}
