import { configDotenv } from 'dotenv';
import express from 'express';
import dotenv from 'dotenv' ; 
import userRoute from './routes/userRoutes.js';
import prisma from './src/config/prisma.js';
import templateRoutes from './src/routes/templateRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';



dotenv.config();


const app = express();

const PORT = process.env.PORT || 5000; 
app.use(express.json());
// Test Route for Prisma 
app.get('/test-db', async (req, res) => {
    const templates = await prisma.template.findMany();

    res.json({
        success: true,
        data: templates
    });
});


app.use('/documents', documentRoutes);



app.use('/templates', templateRoutes);


// Routes
app.use('/user',userRoute)





// Starting Server 
app.listen(PORT,()=>{
    console.log(`Server is running at http//:localhost:${PORT}`);
})