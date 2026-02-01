const { prisma } = require("../config/db");

// 1. FUNGSI UNTUK CHECKOUT (ADD)
const addTransaction = async (req, res) => {
  try {
    const { items } = req.body; 
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Keranjang masih kosong." });
    }

    const result = await prisma.$transaction(async (tx) => {
      let totalPay = 0;
      const detailData = [];

      for (const item of items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId }
        });

        if (!medicine) throw new Error(`Obat ID ${item.medicineId} tidak ditemukan.`);
        if (medicine.stock < item.qty) throw new Error(`Stok ${medicine.name} tidak mencukupi.`);

        totalPay += medicine.price * item.qty;

        detailData.push({
          medicineId: item.medicineId,
          qty: item.qty,
          price: medicine.price
        });

        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.qty } }
        });
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
          totalPay,
          status: "SUCCESS",
          detail: {
            create: detailData
          }
        },
        include: {
          detail: { include: { medicine: true } }
        }
      });

      return transaction;
    });

    res.status(201).json({ status: "success", data: result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// 2. FUNGSI UNTUK RIWAYAT (AMBIL DATA) - INI YANG BIKIN BLANK KALAU TIDAK ADA
const getMyTransaction = async (req, res) => {
  try {
    const userId = req.user.id; // Diambil dari token authMiddleware

    const transactions = await prisma.transaction.findMany({
      where: { userId: userId },
      include: {
        detail: {
          include: {
            medicine: true // Mengambil info nama & gambar obat
          }
        }
      },
      orderBy: {
        dates: "desc" // Transaksi terbaru di atas
      }
    });

    res.status(200).json({
      status: "success",
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllTransaction = async (req, res) => {
  try {
    // Pastikan hanya Admin yang bisa akses (sudah dicek di route biasanya, tapi aman ditambahkan)
    const transactions = await prisma.transaction.findMany({
      include: {
        user: { select: { name: true, email: true } }, // Lihat siapa pembelinya
        detail: {
          include: { medicine: true }
        }
      },
      orderBy: { dates: "desc" }
    });

    res.status(200).json({ status: "success", data: transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. FUNGSI UNTUK ADMIN: UPDATE STATUS (Lunas/Batal)
const updateStatusTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // SUCCESS, PENDING, CANCELLED

    const updated = await prisma.transaction.update({
      where: { id: id },
      data: { status: status }
    });

    res.status(200).json({ status: "success", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. JANGAN LUPA DUA-DUANYA DI-EXPORT!
module.exports = { addTransaction, getMyTransaction,getAllTransaction, 
  updateStatusTransaction };