const { prisma } = require("../config/db");
const { param } = require("../routes/auth");

const addMedicine= async(req,res)=>{
    const {medicineName,categoryId,price,stock,drug_class,indication,dosage,min_age,side_effect}=req.body;
    //check if medicine exist
    const medicineExist = await prisma.medicine.findUnique({
        where: {name: medicineName},
    });
    if(medicineExist){
        return res.status(401).json({error:"Medicine already exist"})
    };

    //create 
    const medicine = await prisma.medicine.create({
        data:{
            name: medicineName,
            categoryId,
            price,
            stock,
            drug_class,
            indication,
            dosage,
            min_age,
            side_effect
        }
    })
res.status(201).json({
  status: "success",
  data: medicine
})


}
const updateMedicine = async (req, res) => {
    const { id } = req.params;
    const { 
        name, 
        price, 
        stock, 
        addStock, 
        categoryId,
        description 
    } = req.body;
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }
        const existingMedicine = await prisma.medicine.findUnique({ where: { id } });
        if (!existingMedicine) {
            return res.status(404).json({ error: "Medicine not found" });
        }
        const dataToUpdate = {};
        if (name) dataToUpdate.name = name;
        if (price) dataToUpdate.price = parseInt(price);
        if (categoryId) dataToUpdate.categoryId = parseInt(categoryId);
        if (description) dataToUpdate.description = description;
        if (addStock) {
            dataToUpdate.stock = { increment: parseInt(addStock) };
        } else if (stock !== undefined) {
            dataToUpdate.stock = parseInt(stock);
        }
        const updatedItem = await prisma.medicine.update({
            where: { id },
            data: dataToUpdate
        });

        res.status(200).json({
            status: "success",
            data: { medicine: updatedItem }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


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
        // 1. Ambil query parameter dari URL
        const { search, category } = req.query;

        // 2. Bangun filter 'where' secara dinamis
        const whereClause = {
            isDeleted: false, // Filter utama: jangan ambil yang sudah dihapus
        };

        // Jika ada pencarian nama
        if (search) {
            whereClause.name = {
                contains: search,
                mode: 'insensitive', // Case-insensitive
            };
        }

        // Jika ada filter kategori (berdasarkan nama kategori)
        if (category && category !== "Semua Obat") {
            whereClause.category = {
                name: category // Filter relasi ke tabel Category berdasarkan field 'name'
            };
        }

        const medicines = await prisma.medicine.findMany({
            where: whereClause,
            include: {
                category: true 
            },
            orderBy: {
                name: 'asc' // Urutkan abjad agar rapi
            }
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

