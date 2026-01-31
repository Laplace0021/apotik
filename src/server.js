const {config} =require("dotenv")
const express = require('express');
const app =express();



//body parsing middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}))

const {connectDB, disconnectDB}=require("./config/db")
app.use("/medicines",medicines = require("./routes/medicines"))
app.use("/auth", auth= require("./routes/auth"))
app.use("/transaction", auth= require("./routes/transaction"))

config();
connectDB(); 

const PORT = 5001;
const server = app.listen(PORT, () =>{
  console.log(`Server running on PORT ${PORT}`)
}) 

//AUTH - LOGIN/REGISTER
//MEDICINES - GET ALL MEDICINES
//USER - USER DATA

process.on("unhandledRejection", (err)=> {
  console.error("Unhandle Rejection", err)
  server.close(async ()=>{
    await disconnectDB();
    process.exit(1)
  });
});

process.on("uncaughtException", async (err)=>{
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

process.on("SIGTERM", async()=>{
  console.log("SIGTERM receive, shutting down gracefully");
  server.close(async()=>{
    await disconnectDB();
    process.exit(1)
  })
})