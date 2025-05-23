/* eslint-disable no-unused-vars */
import toast from "react-hot-toast";
import { useAuth } from "../Context/Authprovider";


const Logout = () => {
    const [auth, setAuth] = useAuth();

    const handleLogout = () => {
        try {
            setAuth({
                ...auth,
                user: null
            })
            localStorage.removeItem("User")
            toast.success("Đăng xuất thành công")
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        } catch (error) {
            toast.error("Lỗi: Có gì đó không đúng")
            setTimeout(() => { }, 2000)
        }
    }

    return (
        <>
            <button className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-800 duration-300 cursor-pointer md:px-3 md:py-2" onClick={() => document.getElementById('modal_logout').showModal()}>Đăng xuất</button>
            <dialog id="modal_logout" className="modal">
                <div className="modal-box dark:bg-slate-900 dark:text-white ">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <div className="p-4 md:p-5 text-center">
                        <svg
                            className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Bạn có chắc chắn muốn đăng xuất không?
                        </h3>
                        <form method="dialog">
                            <button
                                data-modal-hide="popup-modal"
                                className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                                onClick={handleLogout}
                            >
                                Có, tôi chắc chắn
                            </button>
                            <button
                                className=" py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            >
                                Không, hủy bỏ
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    )
};

export default Logout;
