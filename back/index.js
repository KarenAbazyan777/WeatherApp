require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./router/router');
const cors = require('cors');
const PORT =  process.env.PORT || 5000;


const app = express();

app.use(express.json());
app.use(cors({
    credentials:true,
    origin:"*"  
}));
app.use("/auth",authRouter);


const start = async()=>{
    try {
        await mongoose.connect(process.env.DB_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        app.listen(PORT,()=>console.log('uraaaaaa'))
    } catch (error) {
        console.log(error);
    }
}

start();