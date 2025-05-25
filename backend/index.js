import express from "express";
import proverbsRoutes from './routes/proverbs.js';
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT= process.env.PORT || 3000;

app.use(express.json());
app.use('/proverbs',proverbsRoutes);


app.listen(PORT, ()=>{
    console.log(`your server is running on port ${PORT}`);
});
