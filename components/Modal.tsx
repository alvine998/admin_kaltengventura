/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState, Dispatch, SetStateAction } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export type ModalType<T> = {
  open: boolean;
  type: 'default' | 'create' | 'update' | 'delete' | 'download';
  key?: string;
  data?: T | null;
  isSearch?: boolean;
};

export default function useModal<T>(): [
  ModalType<T>,
  Dispatch<SetStateAction<ModalType<T>>>
] {
  const [modal, setModal] = useState<ModalType<T>>({
    open: false,
    type: 'create',
    key: 'default_key',
    data: null,
    isSearch: false
  });
  return [modal, setModal];
}

export const Modal = ({
  open,
  setOpen,
  children,
  width = 'w-full md:w-2/4',
  isSearch
}: {
  open: boolean;
  setOpen: any;
  children: any;
  width?: string;
  isSearch?: boolean;
}) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={() => {}}
      >
        <div className="flex sm:items-end items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={`inline-block align-bottom bg-white ${width} rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 align-top sm:align-middle sm:p-6`}
            >
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
