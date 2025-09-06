import express from 'express';
import cors from "cors";
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js'
import userModel from './config/model/userModel.js';
import userRouter from './routes/userRoutes.js';


const app = express();
const port = process.env.PORT || 4000;
app.use(cookieParser());
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

// Connect MongoDB
connectDB();





app.get('/', (req, res) => res.send('API is working 🚀'));
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)

app.listen(port, () => {
  console.log(`🚀 Server started at port ${port}`);
});
