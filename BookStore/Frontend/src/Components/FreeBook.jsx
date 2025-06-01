import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import { Link } from "react-router-dom";

const FreeBook = () => {
    const [freebooks, setFreebooks] = useState([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const fetchData = async() => {
            try{
                setLoading(true)
                const res = await axios.get(`${API_URL}/books`)
                setFreebooks(res.data)
                setLoading(false)
            } catch(error){
                console.error(error);
                setLoading(false)
            }
        }
        fetchData();
    },[])

    // Filter theo thể loại hoặc hiển thị 3 sách đầu tiên nếu không có sách loại "Fiction"
    const filterData = freebooks.filter((item) => item.category === "Fiction").slice(0, 3)
    const displayBooks = filterData.length > 0 ? filterData : freebooks.slice(0, 3);
    
    if (loading) {
        return (
            <div className="max-w-screen-2xl container mx-auto md:px-20 px-7">
                <div className="flex justify-center items-center h-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <div className="max-w-screen-2xl container mx-auto md:px-20 px-7" >
                <div className='mt-20 mb-10 md:mt-0'>
                    <h1 className='font-bold text-xl md:text-2xl pd-2 mb-5'>
                        Sách nổi bật
                    </h1>

                    <p className="text-sm md:text-xl">Dưới đây là một số sách nổi bật trong thư viện của chúng tôi. Để truy cập toàn bộ sách, bạn có thể truy cập mục Sách từ thanh điều hướng và tìm sách mình mong muốn, bạn chỉ cần đăng ký và đăng nhập để truy cập toàn bộ sách của chúng tôi.</p>
                </div>
                
                {/* Layout hàng ngang thay thế slider */}
                <div className="flex flex-nowrap overflow-x-auto pb-8 gap-6 mt-8 scrollbar-hide">
                    {displayBooks.map((book) => (
                        <div key={book.id} className="flex-none w-64 min-w-[16rem]">
                            <div className="bg-base-200 dark:bg-slate-900 dark:text-white rounded-lg shadow-md h-full flex flex-col p-4">
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={book.image}
                                        alt={book.name}
                                        className="h-60 w-auto object-cover"
                                    />
                                </div>
                                <div className="mb-2">
                                    <h3 className="card-title text-lg font-semibold">
                                        {book.name}
                                        <span className="badge badge-secondary ml-2 text-xs">{book.category}</span>
                                    </h3>
                                </div>
                                <p className="text-sm mb-4 flex-grow line-clamp-2">{book.title}</p>
                                <div className="card-actions justify-between mt-auto">
                                    <div className="badge badge-outline p-3">{book.lang}</div>
                                    <Link
                                        to={`/read/${book.id}`}
                                        className="badge badge-outline p-3 cursor-pointer hover:bg-pink-500 duration-200 hover:text-black"
                                    >
                                        Read Online
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default FreeBook;
