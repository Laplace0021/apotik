const express = require("express");
const router = express.Router()
const {register, login,logout,getMe} = require("../controllers/authController")
const {authMiddleware} = require("../middleware/authMiddleware")

router.post("/register",register)
router.post("/login",login)
router.use(authMiddleware);
router.post("/logout", logout)
router.get("/me", getMe)



module.exports=router