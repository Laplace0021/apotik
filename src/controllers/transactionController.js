const { prisma } = require("../config/db");

const addTransaction = async (req, res) => {
  try {
    const { medicineId, qty } = req.body;

    // 1. Validasi Obat & Stok
    const medicineExist = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicineExist) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    if (medicineExist.stock < qty) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // 2. Hitung Total Bayar
    const totalHarga = medicineExist.price * qty;

    // 3. Jalankan Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Buat Header Transaksi
      const transaction = await tx.transaction.create({
        data: { 
          userId: req.user.id,
          totalPay: totalHarga,
          status: "SUCCESS" // Status default
        },
      });

      // Buat Detail Transaksi
      const detail = await tx.detailTransaction.create({
        data: {
          transactionId: transaction.id,
          medicineId,
          qty,
          price: medicineExist.price, // Simpan harga saat transaksi terjadi
        },
      });

      // Update Stok (Decrement)
      await tx.medicine.update({
        where: { id: medicineId },
        data: {
          stock: { decrement: qty },
        },
      });

      return { transaction, detail };
    });

    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// AMBIL TRANSAKSI SAYA (USER)
const getMyTransaction = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      include: {
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

// AMBIL SEMUA TRANSAKSI (ADMIN)
const getAllTransaction = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: { select: { name: true, email: true } },
        detail: { include: { medicine: true } }
      },
      orderBy: { dates: "desc" }
    });

    res.status(200).json({ status: "success", data: transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addTransaction, getMyTransaction, getAllTransaction };