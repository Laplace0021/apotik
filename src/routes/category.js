const express = require("express");
const router = express.Router();
const { getAllCategories, addCategory } = require("../controllers/categoryController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// Publik bisa melihat daftar kategori (untuk Sidebar Home)
router.get("/", getAllCategories);

// Hanya Admin yang bisa menambah kategori baru
router.post("/", authMiddleware, adminMiddleware, addCategory);

module.exports = router;