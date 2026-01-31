const { prisma } = require("../config/db");

const addTransaction = async (req, res) => {
  try {
    // Frontend sekarang harus mengirim: { items: [{ medicineId, qty }, ...] }
    const { items } = req.body; 
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Keranjang masih kosong." });
    }

    // Gunakan DB Transaction agar jika satu gagal, semua dibatalkan
    const result = await prisma.$transaction(async (tx) => {
      let totalPay = 0;
      const detailData = [];

      // 1. Loop semua item untuk validasi stok & hitung harga
      for (const item of items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId }
        });

        if (!medicine) throw new Error(`Obat ID ${item.medicineId} tidak ditemukan.`);
        if (medicine.stock < item.qty) throw new Error(`Stok ${medicine.name} tidak mencukupi.`);

        totalPay += medicine.price * item.qty;

        // Siapkan data untuk DetailTransaction
        detailData.push({
          medicineId: item.medicineId,
          qty: item.qty,
          price: medicine.price // Simpan harga saat transaksi
        });

        // 2. Kurangi stok setiap obat
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.qty } }
        });
      }

      // 3. Buat satu Header Transaksi dengan banyak Detail
      const transaction = await tx.transaction.create({
        data: {
          userId,
          totalPay,
          status: "SUCCESS",
          detail: {
            create: detailData // Nested create otomatis mengisi transactionId
          }
        },
        include: {
          detail: {
            include: { medicine: true } // Return info lengkap
          }
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