import React, { SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
    label: string,
    options: any[]
}

export default function Select(props: Props) {
    const { label, options } = props
    return (
        <div className='my-2 flex flex-col w-full'>
            {
                label &&
                <label htmlFor={label} className='text-gray-500'>{label || ""}</label>
            }
            <select id={label} {...props}
                className="block w-full rounded-md border-0 p-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:outline-none sm:text-sm sm:leading-6"
            >
                {
                    options?.map((v: any, i: number) => <option key={i} value={v?.value} >{v?.label}</option>)
                }
            </select>
        </div>
    )
}
