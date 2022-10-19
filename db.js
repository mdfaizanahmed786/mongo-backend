require('dotenv').config();
const mongoose=require('mongoose');

const mongooseConnect=()=>{
mongoose.connect(process.env.MONGODB_CONNECTION_URL, ()=>{
console.log("connection was successful")
})
}


module.exports=mongooseConnect;	

