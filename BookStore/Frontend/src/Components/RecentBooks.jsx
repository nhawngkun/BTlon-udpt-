import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from './Card';
import API_URL from '../config';

const RecentBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/books`);
        setBooks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu sách:', error);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Phân loại sách theo danh mục để hiển thị
  const getBooksByCategory = (category) => {
    return books.filter(book => book.category === category).slice(0, 4);
  };

  // Lấy tất cả sách và giới hạn số lượng để hiển thị
  const getAllBooks = () => {
    return books.slice(0, 8);
  };

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
    <div className="max-w-screen-2xl container mx-auto md:px-20 px-7 py-12">
      <h2 className="text-3xl font-bold mb-8">Khám phá sách mới</h2>
      
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Sách mới nhất</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getAllBooks().map(book => (
            <Card key={book.id} item={book} />
          ))}
        </div>
      </div>

      {getBooksByCategory('Fiction').length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Tiểu thuyết</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getBooksByCategory('Fiction').map(book => (
              <Card key={book.id} item={book} />
            ))}
          </div>
        </div>
      )}

      {getBooksByCategory('Science').length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Khoa học</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getBooksByCategory('Science').map(book => (
              <Card key={book.id} item={book} />
            ))}
          </div>
        </div>
      )}

      {getBooksByCategory('Poetry').length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Thơ ca</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getBooksByCategory('Poetry').map(book => (
              <Card key={book.id} item={book} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentBooks;