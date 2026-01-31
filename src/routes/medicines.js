const express = require("express");
const router = express.Router()
const {getMedicine,addMedicine, updateMedicine, deleteMedicine, getMedicineById} = require("../controllers/medicinesController")
const {authMiddleware} = require("../middleware/authMiddleware")

router.get("/",getMedicine)
router.get("/:id",getMedicineById)
router.use(authMiddleware);
router.post("/",addMedicine)
router.put("/:id",updateMedicine)
router.delete("/:id",deleteMedicine)



module.exports=router