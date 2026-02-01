const { prisma } = require("../config/db");

// Ambil semua kategori
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json({ status: "success", data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tambah kategori baru (Opsional, untuk Admin)
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: { name }
    });
    res.status(201).json({ status: "success", data: category });
  } catch (error) {
    res.status(400).json({ error: "Kategori sudah ada atau data tidak valid" });
  }
};

module.exports = { getAllCategories, addCategory };