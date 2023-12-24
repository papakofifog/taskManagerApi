const mongoose= require('mongoose');

require('dotenv').config();

const url="mongodb://127.0.0.1:27017/taskManagerApp";

const connectToTaskManagerDB= async ()=>{
    try{
        let dbConnection= await mongoose.connect(url);
        if(dbConnection){
            console.log("Connected to the database Successfully");
            return dbConnection;
        }
    }catch(e){
        next(e)
    }
}

module.exports= connectToTaskManagerDB;