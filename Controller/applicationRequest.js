//const passport= require('../Middleware/passport')
require('dotenv').config();
const {createAUser, getOneUser, findOneUser, checkRegisterDataformat, checkLoginDataformat, checkIfUserExists}= require('../Module/userModule');
const {encryptPassword, verifyPassword}= require("../util/encryptPassword");
const {createToken, createRefreshToken}= require('../Middleware/JWT');
const {successMessage,successMessageWithData,failureMessage,failureMessageWithData, ErrorMeessage,loginSuccessMessage}= require("../util/manageResponses")

const registerUser= async (req,res,next)=>{
    try{
        if(! (checkRegisterDataformat(req.body, next))) return res.json(failureMessage("All fields required"));
        req.body.password= await encryptPassword(req.body.password,next);
        let newUser= await createAUser(req.body,next)
        if( newUser)return res.json(successMessage("User registered Successfully"))
    }catch(e){
        return next(e);
    }
}

const loginUserWithJWT= async (req,res,next)=>{
    try{
        if(!(checkLoginDataformat(req.body), next)) return res.json(failureMessage("All fields required"));
        let user= await findOneUser(req.body.email, next);
        if(!user)return res.status(401).json(failureMessage("User does not exist proceed to SignUp"));
        let isPasswordVerified= await verifyPassword(req.body.password, user.password);
        if(!(isPasswordVerified)) return res.status(400).json(failureMessage("Invalid User name or password"));
        let token=  createToken(user);
        let refreshToken= createRefreshToken(user);
        return res.status(200).json(loginSuccessMessage("Login Successfully",token,refreshToken));
    }catch(e){
        return next(e);
    }
    
    
}

const getNewAccessToken= async(req,res, next)=>{
    try{
        let existingUser=await checkIfUserExists(req.body.id);
        if(!( existingUser)) return res.json(ErrorMeessage("User does not exist"));
        let user=await getOneUser(req.body.id);
        let newToken= createToken(user);
        let newRefreshToken=createRefreshToken(user);
        return res.json(loginSuccessMessage("Logged In success", newToken, newRefreshToken));
    }catch(e){
        return next(e);
    }
}

module.exports= {registerUser, loginUserWithJWT, getNewAccessToken}