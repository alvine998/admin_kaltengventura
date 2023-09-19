import { RxHamburgerMenu } from 'react-icons/rx'
import { FaHome, FaUserFriends, FaBook, FaUser, FaMoneyBill } from 'react-icons/fa'
import { useState } from 'react'

type Props = {
    open: boolean,
    setOpen: any
}

export default function Topbar(props: Props) {
    const { open, setOpen } = props

    const handleLogout = async () => {
        await localStorage.removeItem("uid")
    }
    return (
        <div className={`w-full ${open ? "h-100 absolute" : "h-20"} transition-all duration-300 p-2 bg-[#15406A] z-40`}>
            <div className='flex justify-between items-center sm:pt-3 transition-all duration-300'>
                <a className='text-white text-2xl' href="https://temank3.kemnaker.go.id">
                    KALTENGVENTURA
                </a>
                <div className='sm:block hidden sm:px-5 px-0'>
                    <ul className='flex'>
                        <li className='flex items-center px-4 py-2 gap-1'><FaHome className='text-lg text-white' /><a href="/main/dashboard" className="block text-white">Beranda</a></li>
                        <li className='flex items-center px-4 py-2 gap-1'><FaUserFriends className='text-lg text-white' /><a href="/main/debtor/list" className="block text-white">Data Debitur</a></li>
                        <li className='flex items-center px-4 py-2 gap-1'><FaMoneyBill className='text-lg text-white' /><a href="/main/payment/list" className="block text-white">Data Transaksi</a></li>
                        <li className='flex items-center px-4 py-2 gap-1'><FaUser className='text-lg text-white' /><a href="/main/user/list" className="block text-white">Pengguna</a></li>
                        <li className='flex items-center px-4 py-2 gap-1'><a href="/auth/login" onClick={handleLogout} className="block text-white">Logout</a></li>
                    </ul>
                </div>
                <button onClick={() => {
                    setOpen(!open)
                }} className='border sm:hidden border-[#FFFFFF8C] focus:border-2 p-2 rounded-md w-16 flex items-center justify-center'>
                    <RxHamburgerMenu className='text-[#FFFFFF8C]' fontSize={30} />
                </button>
            </div>
            <div className={`${open ? "block" : "hidden"}`} id='dropdown-menu'>
                <ul>
                    <li className='flex items-center px-4 py-2 gap-1'><FaHome className='text-lg text-white' /><a href="/main/dashboard" className="block text-white">Beranda</a></li>
                    <li className='flex items-center px-4 py-2 gap-1'><FaUserFriends className='text-lg text-white' /><a href="/main/debtor/list" className="block text-white">Data Debitur</a></li>
                    <li className='flex items-center px-4 py-2 gap-1'><FaMoneyBill className='text-lg text-white' /><a href="/main/payment/list" className="block text-white">Data Transaksi</a></li>
                    <li className='flex items-center px-4 py-2 gap-1'><FaUser className='text-lg text-white' /><a href="/main/user/list" className="block text-white">Pengguna</a></li>
                    <li className='flex items-center px-4 py-2 gap-1'><a href="/auth/login" onClick={handleLogout} className="block text-white">Logout</a></li>
                </ul>
            </div>
        </div>
    )
}
