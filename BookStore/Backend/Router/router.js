import express from 'express'
import usersignup from '../Controllers/usersignup.js';
import books from '../Controllers/books.js';
import userlogin from '../Controllers/userlogin.js';
import userprofile from '../Controllers/userprofile.js';
import deleteprofile from '../Controllers/deleteprofile.js';
import editprofile from '../Controllers/editprofile.js';
import deleteBook from '../Controllers/deleteBook.js';
import editBook from '../Controllers/editBook.js';
import addBook from '../Controllers/addBook.js';
import getBook from '../Controllers/getBook.js';
import readBook from '../Controllers/readBook.js';
import searchBook from '../Controllers/searchBook.js';
import { getAllUsers, getStats, deleteUser, runSeedBooks, syncBooksNeo4j } from '../Controllers/adminControllers.js';
import authMiddleware from '../Middleware/authMiddleware.js';


const router = express.Router();

// Đăng nhập, đăng ký
router.post('/user/login', userlogin);
router.post('/user/signup', usersignup)

// User profile
router.get('/user/profile/:id', userprofile)
router.delete('/user/profile/:id', deleteprofile)
router.put('/user/profile/:id', editprofile)

// Books
router.get('/books', books)
router.get('/book/:id', getBook)
router.get('/book/read/:id', readBook)
router.post('/book/add', addBook)
router.put('/book/edit/:id', editBook)
router.delete('/book/delete/:id', deleteBook)

// Search
router.get('/books/search', searchBook)

// Admin routes - thêm middleware kiểm tra quyền admin
router.get('/admin/users', getAllUsers);
router.get('/admin/stats', getStats);
router.delete('/admin/users/:id', deleteUser);
router.post('/admin/seed-books', runSeedBooks); // API chạy seedBooksNeo4j
router.post('/admin/sync-books', syncBooksNeo4j); // API chạy syncBooksNeo4jFull

// Other routes
// router.post('/sendmail', sendmail);

export default router