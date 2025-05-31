import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../Context/Authprovider';
import API_URL from '../../config';
import { toast } from 'react-hot-toast';

const AdminLayout = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        let userId = auth?.user?.id;
        // Nếu context mất user, lấy lại từ localStorage
        if (!userId) {
          const userInfo = localStorage.getItem("User");
          if (userInfo) {
            const user = JSON.parse(userInfo);
            userId = user?.id;
          }
        }
        if (!userId) {
          navigate('/login');
          return;
        }

        // Kiểm tra quyền admin
        const response = await axios.get(`${API_URL}/user/profile/${userId}`);
        const userRole = response.data.role;
        
        if (userRole && userRole.toLowerCase() === 'admin') {
          setIsAdmin(true);
        } else {
          toast.error("Bạn không có quyền truy cập trang admin");
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [auth?.user?.id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Đã có navigate ở useEffect
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 dark:text-white">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-800 shadow-md flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-pink-600">BookStore Admin</h1>
        </div>
        <nav className="flex-grow pt-6">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/admin" 
                className="block py-3 px-6 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-pink-600"
              >
                Bảng điều khiển
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/books" 
                className="block py-3 px-6 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-pink-600"
              >
                Quản lý Sách
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/users" 
                className="block py-3 px-6 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-pink-600"
              >
                Quản lý Người dùng
              </Link>
            </li>
            <li>
              <Link 
                to="/" 
                className="block py-3 px-6 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-pink-600"
              >
                Quay lại trang chủ
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Bảng điều khiển Admin</h1>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
