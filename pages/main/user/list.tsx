import Button from "@/components/Button";
import Layout from "@/components/Layout";
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import useModal, { Modal } from "@/components/Modal";
import axios from "axios";
import Input from "@/components/Input";
import { CONFIG } from "@/config";
import { User } from "@/types/user";

export async function getServerSideProps(context: any) {
  const { search, page, size } = context.query;
  try {
    const result = await axios.get(
      CONFIG.base_url_api +
        `/user/list?pagination=true&search=${search || ""}&page=${
          +page > 0 ? +page : +page - 1
        }&size=${+size || 10}`,
      {
        headers: {
          "bearer-token": "kaltengventura2023",
        },
      }
    );
    return {
      props: {
        table: result.data || [],
      },
    };
  } catch (error) {
    console.log(error);
  }
}

export default function List({ table }: { table: any }) {
  const [info, setInfo] = useState<any>({ loading: false, message: "" });
  const [modal, setModal] = useModal<any>();
  const router = useRouter();
  const [show, setShow] = useState<boolean>(false);
  const columns: any = [
    {
      name: "Nama",
      right: false,
      selector: (row: User) => row?.name,
    },
    {
      name: "Email",
      right: false,
      selector: (row: User) => row?.email,
    },
    {
      name: "No HP",
      right: false,
      selector: (row: User) => row?.phone,
    },
    {
      name: "Foto",
      right: false,
      selector: (row: User) =>
        row.photo ? (
          <a href={row.photo} target="_blank">
            <img src={row.photo} className="w-10" />
          </a>
        ) : (
          "-"
        ),
    },
     {
      name: "Role",
      right: false,
      selector: (row: any) => row?.from,
    },
    {
      name: "Status",
      right: false,
      selector: (row: User) => row?.status,
    },
    {
      name: "Aksi",
      right: false,
      selector: (row: User) => (
        <>
          <button
            type="button"
            onClick={() => {
              setModal({ ...modal, open: true, key: "update", data: row });
            }}
            className="text-green-500 text-xs"
          >
            Edit
          </button>
          &nbsp; &nbsp;
          <button
            type="button"
            onClick={() => {
              setModal({ ...modal, open: true, key: "delete", data: row });
            }}
            className="text-red-500 text-xs"
          >
            Hapus
          </button>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (typeof window !== undefined) {
      setShow(!show);
    }
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    setInfo({ loading: true });
    const formData: any = Object.fromEntries(new FormData(e.target));
    try {
      const payload = {
        ...formData,
        id: modal?.data?.id,
        from: "admin",
      };
      let result = null;
      modal.key == "create"
        ? (result = await axios.post(CONFIG.base_url_api + `/user`, payload, {
            headers: { "bearer-token": "kaltengventura2023" },
          }))
        : (result = await axios.patch(CONFIG.base_url_api + `/user`, payload, {
            headers: { "bearer-token": "kaltengventura2023" },
          }));
      setModal({ ...modal, open: false });
      setInfo({
        loading: false,
        message: "Berhasil menyimpan data!",
        type: "success",
      });
      router.push("/main/user/list");
    } catch (error) {
      console.log(error);
      setInfo({
        loading: false,
        message: "Berhasil menyimpan data!",
        type: "error",
      });
    }
  };

  const handleDelete = async (e: any) => {
    e.preventDefault();
    setInfo({ loading: true });
    try {
      const result = await axios.delete(
        CONFIG.base_url_api + `/user?id=${modal?.data?.id}`,
        {
          headers: { "bearer-token": "kaltengventura2023" },
        }
      );
      setModal({ ...modal, open: false });
      setInfo({
        loading: false,
        message: "Berhasil menghapus data!",
        type: "success",
      });
      router.push("");
    } catch (error) {
      console.log(error);
      setInfo({
        loading: false,
        message: "Gagal menghapus data!",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (info.type) {
      setTimeout(() => {
        setInfo({ ...info, type: "", message: "" });
      }, 3000);
    }
  }, [info]);
  return (
    <Layout>
      <div className="p-2">
        {info.type ? (
          <>
            <div
              className={`w-full p-2 rounded-lg ${
                info.type == "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <p className="text-white">{info.message}</p>
            </div>
          </>
        ) : (
          ""
        )}
        <div className="flex justify-between items-center lg:flex-row flex-col-reverse gap-2">
          <div className="lg:w-1/4 w-full">
            <Input
              label=""
              placeholder="Cari Disini..."
              onChange={(e) => {
                router.push(`?search=${e.target.value}`);
              }}
            />
          </div>
          <div className="lg:w-1/6 w-full flex justify-end">
            <Button
              type="button"
              onClick={() => {
                setModal({ ...modal, open: true, key: "create", data: null });
              }}
            >
              Tambah Data
            </Button>
          </div>
        </div>

        <div>
          {show ? (
            <DataTable
              columns={columns}
              data={table?.items}
              paginationTotalRows={table?.total_items}
              pagination={true}
              paginationServer={true}
              paginationDefaultPage={1}
              onChangePage={(pageData) => {
                router.push("?page=" + pageData);
              }}
              onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                router.push(`?page=${currentPage}&size=${currentRowsPerPage}`);
              }}
              striped={true}
              responsive={true}
              highlightOnHover
              pointerOnHover
            />
          ) : (
            ""
          )}
        </div>
        {modal.key == "create" || modal.key == "update" ? (
          <>
            <Modal
              open={modal.open}
              setOpen={() => setModal({ ...modal, open: false })}
            >
              <div>
                <h1 className="text-center font-bold text-lg">
                  {modal.key == "create"
                    ? "Tambah Data Admin"
                    : "Ubah Data Admin"}
                </h1>
                <form onSubmit={handleCreate}>
                  <Input
                    label="Nama"
                    defaultValue={modal?.data?.name}
                    placeholder="Masukkan Nama"
                    name="name"
                  />
                  <Input
                    label="No Hp"
                    defaultValue={modal?.data?.phone}
                    placeholder="Masukkan No Hp"
                    name="phone"
                  />
                  <Input
                    label="Email"
                    defaultValue={modal?.data?.email}
                    placeholder="Masukkan Email"
                    name="email"
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="********"
                    name="password"
                  />
                  <div className="mt-2">
                    <label htmlFor="status">Status</label>
                    <div className="flex gap-4">
                      <div className="flex gap-2">
                        <input
                          type="radio"
                          id="status"
                          defaultChecked={modal?.data?.status == "nonactive"}
                          name="status"
                          value={"nonactive"}
                        />
                        <span>Non Aktif</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="radio"
                          id="status"
                          defaultChecked={modal?.data?.status == "active"}
                          name="status"
                          value={"active"}
                        />
                        <span>Aktif</span>
                      </div>{" "}
                    </div>
                  </div>
                  <div className="my-4">
                    <Button type="submit" disabled={info.loading}>
                      {info.loading ? "Menyimpan..." : "Simpan"}
                    </Button>
                    <Button
                      type="button"
                      color="white"
                      onClick={() => {
                        setModal({ ...modal, open: false });
                      }}
                    >
                      Tutup
                    </Button>
                  </div>
                </form>
              </div>
            </Modal>
          </>
        ) : (
          ""
        )}
        {modal.key == "delete" ? (
          <Modal
            open={modal.open}
            setOpen={() => {
              setModal({ ...modal, open: false });
            }}
          >
            <div>
              <form onSubmit={handleDelete}>
                <h1 className="text-center font-semibold">
                  Hapus Data Pengguna
                </h1>
                <p className="mt-5 text-center">
                  Apakah anda yakin ingin menghapus pengguna {modal.data.name}?
                </p>
                <div className="my-4">
                  <Button type="submit" color="danger" disabled={info.loading}>
                    {info.loading ? "Menghapus..." : "Hapus"}
                  </Button>
                  <Button
                    type="button"
                    color="white"
                    onClick={() => {
                      setModal({ ...modal, open: false });
                    }}
                  >
                    Tutup
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        ) : (
          ""
        )}
      </div>
    </Layout>
  );
}
