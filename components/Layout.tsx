import React, { useEffect, useState } from 'react'
import Topbar from './Topbar'
import { useRouter } from 'next/router';

export default function Layout({ children }: any) {
    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter();
    useEffect(()=>{
        const respon: any = localStorage.getItem("uid")
        if(!respon){
            router.push("/auth/login")
        }
    },[])

    return (
        <div className='relative'>
            <Topbar open={open} setOpen={setOpen} />
            <div className={`${open ? "pt-24" : "p-5"}`}>
                {children}
            </div>
        </div>
    )
}
