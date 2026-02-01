const express = require("express");
const router = express.Router()
const {addTransaction,
        getAllTransaction,
        updateStatusTransaction,
        getMyTransaction
} = require("../controllers/transactionController")
const {authMiddleware} = require("../middleware/authMiddleware")

router.use(authMiddleware);
router.post("/",addTransaction)
router.get("/me",getMyTransaction)
router.get("/",getAllTransaction)
router.get("/:id",updateStatusTransaction)




module.exports=router