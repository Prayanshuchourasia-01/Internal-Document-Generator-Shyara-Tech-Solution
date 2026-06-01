import express from 'express'

const userRoute = express.Router();

userRoute.get('/',(req,res)=>{
    res.send(`Backend of Internal Document Generator `);
})
export default userRoute;