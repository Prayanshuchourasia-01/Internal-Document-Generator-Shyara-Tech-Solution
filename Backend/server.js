import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // <-- ADD THIS
import userRoute from './src/routes/userRoutes.js';
import prisma from './src/config/prisma.js';
import templateRoutes from './src/routes/templateRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';
import departmentRoutes from './src/routes/departmentRoutes.js';
import backupRoutes from './src/routes/backupRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ADD CORS HERE — before express.json() and before routes
app.use(cors({
  origin: 'http://localhost:5173', // your Vite frontend URL
  credentials: true // allow cookies if you add auth later
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... rest of your file stays the same

app.get('/test-db', async (req, res) => {
  try {
    const templates = await prisma.template.findMany();
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/api/documents', documentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/backup', backupRoutes);
app.use('/user', userRoute);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ success: false, message: error.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});