const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');
const transactionRoutes = require('./routes/transactions');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // PENTING: Agar frontend bisa akses backend
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/transactions', transactionRoutes);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});