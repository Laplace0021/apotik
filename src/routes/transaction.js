const express = require("express");
const router = express.Router()
const {addTransaction,
        getAllTransaction,
        getMyTransaction
} = require("../controllers/transactionController")
const {authMiddleware} = require("../middleware/authMiddleware")

router.use(authMiddleware);
router.post("/",addTransaction)
router.get("/me",getMyTransaction)
router.get("/",getAllTransaction)




module.exports=router