import { configDotenv } from 'dotenv';
import express from 'express';
import dotenv from 'dotenv' ; 
import userRoute from './routes/userRoutes.js';



dotenv.config();



const app = express();

const PORT = process.env.PORT || 5000; 
// Routes
app.use('/user',userRoute)

// Starting Server 
app.listen(PORT,()=>{
    console.log(`Server is running at http//:localhost:${PORT}`);
})