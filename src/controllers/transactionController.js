const { prisma } = require("../config/db")

const addTransaction = async (req, res) => {
  const {  medicineId, qty } = req.body

  const medicineExist = await prisma.medicine.findUnique({
    where: { id: medicineId },
  })

  if (!medicineExist) {
    return res.status(404).json({
      error: "Medicine not found",
    })
  }

  if (medicineExist.stock < qty) {
    return res.status(400).json({
      error: "Insufficient stock",
    })
  }

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: { userId: req.user.id },
    })

    const detail = await tx.detailTransaction.create({
      data: {
        transactionId: transaction.id,
        medicineId,
        qty,
      },
    })

    await tx.medicine.update({
      where: { id: medicineId },
      data: {
        stock: {
          decrement: qty,
        },
      },
    })

    return { transaction, detail }
  })

  res.status(201).json({
    status: "success",
    data: result,
  })
}

const getMyTransaction = async(req,res) => {
  const {}= req.body
}

module.exports = { addTransaction }
