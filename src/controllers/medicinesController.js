const { prisma } = require("../config/db");
const { param } = require("../routes/auth");
const cloudinary = require("../config/cloudinary");
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
      medicineName, categoryId, price, stock, 
      drug_class, indication, dosage, min_age, image_url 
    } = req.body;

    let finalImageUrl = null;

    // Prioritas 1: Jika user upload file baru (dari req.file)
    if (req.file) {
      finalImageUrl = req.file.path;
    } 
    // Prioritas 2: Jika tidak ada file baru, pakai URL lama (dari req.body)
    else if (image_url) {
      // Proteksi jika data terkirim ganda (Array), ambil index pertama saja
      finalImageUrl = Array.isArray(image_url) ? image_url[0] : image_url;
    }

    const updated = await prisma.medicine.update({
      where: { id: id },
      data: {
        name: medicineName,
        categoryId: parseInt(categoryId),
        price: parseInt(price),
        stock: parseInt(stock),
        drug_class: drug_class,
        indication: indication,
        dosage: dosage,
        min_age: parseInt(min_age),
        // Hanya update kolom image jika finalImageUrl ada nilainya
        ...(finalImageUrl && { image: finalImageUrl })
      }
    });

    res.status(200).json({ status: "success", data: updated });
  } catch (error) {
    console.error("Update Error:", error);
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

