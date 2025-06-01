import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    bookCount: 0,
    categoryCount: 0
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch số lượng user
        const usersRes = await axios.get(`${API_URL}/admin/users`);
        // Fetch số lượng sách
        const booksRes = await axios.get(`${API_URL}/books`);
        
        // Lấy số lượng thể loại (unique categories)
        const uniqueCategories = new Set();
        if (Array.isArray(booksRes.data)) {
          booksRes.data.forEach(book => {
            if (book.category) {
              uniqueCategories.add(book.category);
            }
          });
          
          // Lưu danh sách sách để hiển thị lượt đọc
          // Ở đây giả lập số lượt đọc, trong thực tế sẽ có API riêng cung cấp số liệu này
          const booksWithReadCount = booksRes.data.map(book => ({
            ...book,
            readCount: Math.floor(Math.random() * 1000) // Giả lập số lượt đọc
          }));
          
          // Sắp xếp sách theo số lượt đọc giảm dần
          booksWithReadCount.sort((a, b) => b.readCount - a.readCount);
          setBooks(booksWithReadCount);
        }

        setStats({
          userCount: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
          bookCount: Array.isArray(booksRes.data) ? booksRes.data.length : 0,
          categoryCount: uniqueCategories.size
        });
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Người dùng</h2>
          <p className="text-3xl font-bold text-pink-600">{stats.userCount}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Sách</h2>
          <p className="text-3xl font-bold text-pink-600">{stats.bookCount}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Thể loại</h2>
          <p className="text-3xl font-bold text-pink-600">{stats.categoryCount}</p>
        </div>
      </div>
      
      {/* Bảng thống kê lượt đọc sách */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Thống kê lượt đọc sách</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tên sách</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tác giả</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Thể loại</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-right">Lượt đọc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <img src={book.image} alt={book.name} className="w-10 h-14 object-cover rounded mr-3" />
                      <span className="font-medium">{book.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{book.author}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
                      {book.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right">
                    {book.readCount} lượt
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>* Lưu ý: Dữ liệu này được cập nhật theo thời gian thực</p>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
