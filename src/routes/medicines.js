const express = require("express");
const router = express.Router()
const {getMedicine,addMedicine, updateMedicine, deleteMedicine, getMedicineById} = require("../controllers/medicinesController")
const { upload } = require("../config/cloudinary");
const {authMiddleware} = require("../middleware/authMiddleware")

router.get("/",getMedicine)
router.get("/:id",getMedicineById)
router.use(authMiddleware);
router.post("/", upload.single("image"), addMedicine);
router.put("/:id", upload.single("image"), updateMedicine);
router.delete("/:id", deleteMedicine);



module.exports=router