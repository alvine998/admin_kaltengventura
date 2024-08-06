import React, { ButtonHTMLAttributes } from 'react'


type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: any,
    color?: 'primary' | 'danger' | 'info' | 'warning' | 'white'
}

export default function Button(props: Props) {
    const {
        children,
        color = 'primary'
    } = props
    return (
        <div className='my-2 w-full'>
            {
                color == 'primary' &&
                <button {...props} className='w-full p-1 bg-green-500 rounded-md text-white'>
                    {children}
                </button>
            }
            {
                color == 'danger' &&
                <button {...props} className='w-full p-1 bg-red-500 rounded-md text-white'>
                    {children}
                </button>
            }
            {
                color == 'warning' &&
                <button {...props} className='w-full p-1 bg-yellow-500 rounded-md text-black'>
                    {children}
                </button>
            }
            {
                color == 'info' &&
                <button {...props} className='w-full p-1 bg-blue-500 rounded-md text-white'>
                    {children}
                </button>
            }
            {
                color == 'white' &&
                <button {...props} className='w-full p-1 border bg-white rounded-md text-green-500'>
                    {children}
                </button>
            }
        </div>
    )
}
