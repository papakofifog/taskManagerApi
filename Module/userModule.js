const e = require('express');
const mongoose= require('mongoose');
const {validateFieldNotNull, noNullKeyValues}= require('../util/validations/validateModel')

const userSchema= new mongoose.Schema({
    username: {
        type:String,
        trum:true,
        min: [5, 'Username should be at least 5 characters long, but git {VALUE}'],
        unique: true,
        validate:{
            validator: (value)=> validateFieldNotNull(value),
            message: "Username is required"
        }
    },
    email: {
        type: String,
        trim:true,
        lowercase:true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email provided is invalid'],
        validate:{
            validator: (value)=> validateFieldNotNull(value),
            message: "Email is required"
        }
    },
    pitureUrl:String,
    password:{
        
        type: String,
        minlength: [8, 'Password should be at least 8 characters long'],
        validate:{
            validator: (value)=> validateFieldNotNull(value),
            message: "Password is required"
        },
        match: [
            /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}|:"<>?`~\-=\[\];',./]).{8,}$/,
            'Password must meet specified criteria'
        ]
    },
    role: {
        type: [String],
        enum: ['taskManager','taskCreator'],
        default: ['taskCreator']
    },
}, {timestamps:true});


const UserModel= mongoose.model('User', userSchema);





async function createAUser(user,next){
    try{
        let newUser= new UserModel({
            pictureUrl:"",...user
        });
        let newUserDocument=await newUser.save();
        return newUserDocument;
    }catch(e){next(e)}
}

async function getOneUser(userId, next){
    try{
        let user= UserModel.findById({_id:userId}).select('-password -createdAt -updatedAt -__v');
        return user;
    }catch(e){next(e)};
}

async function findOneUser(userEmail, next){
    try{
        let existingUser= await UserModel.findOne({email:userEmail});
        return existingUser;
    }catch(e){next(e)};
}



async function updateUsername(data, next){
    try{
        let {username, id}= data;
        let updateUserDocument= await UserModel.updateOne({_id:id}, {
            username: username
        })
        
        return updateUserDocument.acknowledged;
    }catch(e){
         next(e);
    }
}

function hasSameProps(obj1,obj2){
    return Object.keys(obj1).every(function (prop ){
        return obj2.hasOwnProperty(prop);
    })
}

function checkRegisterDataformat(data,next){
    try{

        if(!(noNullKeyValues(data))) return false;
        let idealStructure= new Object({
            username: {
                type:String,
                required: (true, "username is required"),
                min: [5, 'Username should be at least 5 characters long, but git {VALUE}'],
                unique: true
            },
            email: {
                type: String,
                trim:true,
                lowercase:true,
                unique:true,
                required:'Email address is required',
                match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
            },
            password:String,
        
        });
        
        return hasSameProps(idealStructure,data)
    }catch(e){
        next(e);
    }
    
}

function checkLoginDataformat(data, next){
    try{
        if(!(noNullKeyValues(data))) return false;
        let idealStructure= new Object({
            email:String,
            password:String,
        })
        return hasSameProps(idealStructure,data)
    }catch(e){
        next(e);
    }

}

async function checkIfUserExists(userId){
    let user= await UserModel.exists({_id:userId});
    return user;
}



module.exports={createAUser,getOneUser, findOneUser, checkRegisterDataformat, checkLoginDataformat, updateUsername,checkIfUserExists}

