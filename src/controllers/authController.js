const {prisma} = require("../config/db");
const bcrypt =require("bcryptjs")
const {generateToken} =require("../utils/generateToken")

const register = async(req,res) =>{
    const {name, email, password,role} = req.body;
    
    const userExist = await prisma.user.findUnique({
        where: {email: email},
    })

    if (userExist){
        return res.status(400).json({Error:"User already exist with this email"});
    };

    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);
    

    //create user
    const user = await prisma.user.create({
        data:{
            name,
            email,
            password: hashedPassword,
            role
        }
    })
    const token =generateToken(user.id,res);

    res.status(201).json({
        status:"success",
        data:{
            user:{
                id: user.id,
                name: name,
                email: email,
                role,
            },
            token,
        }
    })

};

const login = async (req, res) => {
    const {email, password} = req.body;
    
    const user = await prisma.user.findUnique({
        where: {email: email}
    })

    if (!user){
        return res.status(401).json({Error:"Wrong email or password"});
    }

    const isPasswordValid = await bcrypt.compare(password,user.password)

    if (!isPasswordValid){
        return res.status(401).json({Error:"Wrong email or password"});   
    }

    //generate token
    const token =generateToken(user.id,res);

    res.status(201).json({
        status:"success",
        data:{
            user:{
                id: user.id,
                email: email,
            },
        },token
    })
}

const logout = async(req, res) => {
    res.cookie("jwt", "",{
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({
        status: "success",
        message: " Logged out successfully"
    });
}
const getMe = async (req, res) => {
    // Tidak perlu try-catch database lagi, karena datanya sudah ada di memori (req.user)
    
    if (!req.user) {
        // Jaga-jaga kalau middleware bocor (seharusnya tidak mungkin sampai sini kalau diprotect)
        return res.status(404).json({
            status: "fail",
            message: "User data missing"
        });
    }

    res.status(200).json({
        status: "success",
        data: {
            user: req.user // Langsung ambil dari middleware!
        }
    });
};

module.exports={register,login,logout,getMe}