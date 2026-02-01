const { prisma } = require("../config/db");
const { param } = require("../routes/auth");
const addMedicine = async (req, res) => {
  try {
    const { 
      medicineName, 
      categoryId, 
      price, 
      stock, 
      drug_class, // Harus string yang sesuai Enum: "Obat_Bebas" dll
      indication, 
      dosage, 
      min_age 
    } = req.body;

    const imageUrl = req.file ? req.file.path : (req.body.image_url || "https://placehold.co/400x400?text=No+Image");

// Simpan imageUrl ini ke database Prisma

    const medicine = await prisma.medicine.create({
      data: {
        name: medicineName,
        categoryId: parseInt(categoryId),
        price: parseInt(price),
        stock: parseInt(stock),
        drug_class: drug_class, 
        indication,
        dosage,
        min_age: parseInt(min_age),
        image: imageUrl
      }
    });

    res.status(201).json({ status: "success", data: medicine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ... (addMedicine tetap sama)

const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      medicineName, 
      categoryId, 
      price, 
      stock, 
      drug_class, 
      indication, 
      dosage, 
      min_age 
    } = req.body;

    // 1. Cek apakah obatnya ada
    const existingMedicine = await prisma.medicine.findUnique({ where: { id } });
    if (!existingMedicine) {
        return res.status(404).json({ error: "Medicine not found" });
    }

    // 2. Logika Gambar: Jika ada file baru (req.file), pakai path Cloudinary. 
    // Jika tidak, tetap pakai image yang sudah ada di database.
    const imageUrl = req.file ? req.file.path : (req.body.image_url || "https://placehold.co/400x400?text=No+Image");

// Simpan imageUrl ini ke database Prisma

    // 3. Eksekusi Update
    const updated = await prisma.medicine.update({
      where: { id },
      data: {
        name: medicineName || existingMedicine.name,
        categoryId: categoryId ? parseInt(categoryId) : existingMedicine.categoryId,
        price: price ? parseInt(price) : existingMedicine.price,
        stock: stock !== undefined ? parseInt(stock) : existingMedicine.stock,
        drug_class: drug_class || existingMedicine.drug_class,
        indication: indication || existingMedicine.indication,
        dosage: dosage || existingMedicine.dosage,
        min_age: min_age ? parseInt(min_age) : existingMedicine.min_age,
        image: imageUrl,
      },
    });

    res.status(200).json({ status: "success", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMedicine = async (req, res) => {
    const { id } = req.params; // Perbaikan dari req.param ke req.params
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }
        
        await prisma.medicine.update({
            where: { id: id },
            data: { isDeleted: true }
        });

        res.status(200).json({
            status: "success",
            message: "Medicine deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getMedicine = async (req, res) => {
  try {
    const { search, category } = req.query;

    const whereClause = {
      isDeleted: false,
    };

    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Filter berdasarkan NAMA Kategori
    if (category && category !== "Semua Obat") {
      whereClause.category = {
        name: category 
      };
    }

    const medicines = await prisma.medicine.findMany({
      where: whereClause,
      include: {
        category: true // Ini akan mengambil objek kategori lengkap
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      status: "success",
      data: { medicines }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getMedicineById = async (req, res) => {
    const { id } = req.params;

    try {
        // Gunakan findFirst agar bisa filter isDeleted: false
        const medicine = await prisma.medicine.findFirst({
            where: {
                id: id,            // Cari ID yang sesuai
                isDeleted: false   // DAN pastikan belum dihapus
            },
            include: {
                category: true     // Sertakan data kategori (opsional, tapi berguna buat frontend)
            }
        });

        // Jika obat tidak ditemukan atau sudah dihapus
        if (!medicine) {
            return res.status(404).json({
                status: "fail",
                message: "Medicine not found"
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                medicine
            }
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

module.exports={addMedicine,updateMedicine,deleteMedicine,getMedicine, getMedicineById}

