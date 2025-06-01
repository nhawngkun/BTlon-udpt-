import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import API_URL from '../../config';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    author: '',
    category: '',
    lang: 'Vietnamese',
    image: '',
    title: '',
    content: '',
    description: '',
    link: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/books`);
      setBooks(response.data);
      
      // Lấy danh sách các thể loại duy nhất
      const uniqueCategories = new Set();
      if (Array.isArray(response.data)) {
        response.data.forEach(book => {
          if (book.category) {
            uniqueCategories.add(book.category);
          }
        });
        setCategories(Array.from(uniqueCategories));
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Không thể tải danh sách sách');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { // Tạo URL tạm thời, không phù hợp để lưu vào DB
        // Lưu base64 vào formData để gửi lên server
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedData = { ...formData };
      
      if (isEditing) {
        // Xử lý chỉnh sửa sách
        await axios.put(`${API_URL}/book/edit/${formData.id}`, updatedData);
        toast.success('Cập nhật sách thành công');
        fetchBooks();
        resetForm();
      } else {
        // BƯỚC 1: Thêm sách mới vào Neo4j và log chi tiết hơn
        console.log("🔄 BƯỚC 1: Thêm sách mới", {
          tên: updatedData.name,
          tácGiả: updatedData.author,
          thểLoại: updatedData.category
        });
        
        const addResponse = await axios.post(`${API_URL}/book/add`, updatedData);
        
        if (!addResponse.data.success) {
          throw new Error(`⛔ Thêm sách thất bại: ${addResponse.data.message}`);
        }
        
        const newBookId = addResponse.data.data.id;
        console.log(`✅ Sách đã được thêm thành công với ID: ${newBookId}`);
        
        // BƯỚC 2: Tạo quan hệ với tác giả và thể loại
        console.log(`🔄 BƯỚC 2: Tạo quan hệ cho sách ID=${newBookId}`);
        const connectData = {
          bookId: newBookId,
          author: updatedData.author,
          category: updatedData.category
        };
        
        // Thiết lập timeout dài hơn để tránh lỗi mạng 
        const relationshipResponse = await axios.post(
          `${API_URL}/admin/connect-book-relationships`, 
          connectData,
          { timeout: 10000 } // Tăng timeout lên 10 giây
        );
        
        console.log("✅ Kết quả tạo quan hệ:", relationshipResponse.data);
        
        toast.success('Thêm sách mới thành công và đã liên kết với tác giả và thể loại');
        fetchBooks();
        resetForm();
      }
    } catch (error) {
      console.error('❌ LỖI:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response) {
        // Lỗi từ phía server
        toast.error(`Lỗi (${error.response.status}): ${error.response.data.message || 'Không thể xử lý yêu cầu'}`);
      } else if (error.request) {
        // Không nhận được phản hồi
        toast.error('Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối.');
      } else {
        // Lỗi khác
        toast.error(`Lỗi: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/book/delete/${id}`);
      toast.success('Xóa sách thành công');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Lỗi khi xóa sách');
    }
  };

  const editBook = (book) => {
    setFormData({
      id: book.id,
      name: book.name || '',
      author: book.author || '',
      category: book.category || '',
      lang: book.lang || 'Vietnamese',
      image: book.image || '',
      title: book.title || '',
      content: book.content || '',
      description: book.description || '',
      link: book.link || '',
    });
    setImagePreview(book.image || '');
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      author: '',
      category: '',
      lang: 'Vietnamese',
      image: '',
      title: '',
      content: '',
      description: '',
      link: '',
    });
    setSelectedImage(null);
    setImagePreview("");
    setIsEditing(false);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý sách</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Đóng form' : 'Thêm sách mới'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1">Tên sách</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Tác giả</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Thể loại</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                  list="categories"
                  required
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label className="block mb-1">Ngôn ngữ</label>
                <select
                  name="lang"
                  value={formData.lang}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                >
                  <option value="Vietnamese">Vietnamese</option>
                  <option value="English">English</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1">Hình ảnh</label>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm mb-1">Xem trước:</p>
                      <img 
                        src={imagePreview} 
                        alt="Xem trước" 
                        className="h-40 object-contain border rounded" 
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">hoặc nhập URL hình ảnh:</p>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1">Link tải xuống (nếu có)</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-1">Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-1">Nội dung</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
              >
                {isEditing ? 'Cập nhật' : 'Thêm sách'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="py-3 px-4 text-left">Tên sách</th>
              <th className="py-3 px-4 text-left">Tác giả</th>
              <th className="py-3 px-4 text-left">Thể loại</th>
              <th className="py-3 px-4 text-left">Ngôn ngữ</th>
              <th className="py-3 px-4 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {books.map(book => (
              <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={book.image}
                      alt={book.name}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <span className="truncate max-w-[200px]">{book.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">{book.author}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
                    {book.category}
                  </span>
                </td>
                <td className="py-3 px-4">{book.lang}</td>
                <td className="py-3 px-4 space-x-2">
                  <button
                    onClick={() => editBook(book)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBooks;
