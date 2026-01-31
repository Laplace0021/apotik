const jwt = require("jsonwebtoken")
const {prisma} = require("../config/db");




const authMiddleware = async(req,res,next)=>{
    console.log("auth middleware reach")
    let token;
    if(req.headers.authorization && req.headers.authorization.toLowerCase().startsWith("bearer ")){
        token=req.headers.authorization.split(" ")[1]
    } else if(req.cookies?.jwt){
        token=req.cookies.jwt;
    }

    if(!token){
        return res.status(401).json({error:"not authorize. no token provided"})
    }

    try {
        const decoded= jwt.verify(token, process.env.JWT_SECRET)
       const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                // id: true,
                name: true,
                email: true,
                createAt: true,
                role: true // Uncomment jika ada
                // Password TIDAK dipilih, jadi aman.
            }
        });

        if(!user){
            return res.status(401).json({error:"user no longer exist"})
        }
        req.user=user;
        next()
    } catch (error) {
        return res.status(401).json({ error: "not authorize"})
    }

}

module.exports = {authMiddleware}