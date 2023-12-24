require('dotenv').config();
const { sign, verify,}= require('jsonwebtoken');
const {jwtDecode}= require('jwt-decode');
const {ErrorMeessage} = require("../util/manageResponses");


const createToken= (user) =>{
    const accessToken = sign(
        {   id: user._id,
            username: user.username,
            userRole:user.role
        },
        process.env['JWTSECRET'],
        {
            expiresIn:"5h",
        }
    );
    return accessToken;
}

const createRefreshToken=(user)=>{
    const accessToken = sign(
        {   id: user._id,
            username: user.username,
            userRole:user.role
        },
        process.env['JWTREFRESHTOKEN'],
        {
            expiresIn:"7h",
        }
    );
    return accessToken;
}

const createEmailToken= (user)=>{
    const accessToken= sign(
        {id: user._id},
        process.env['JWTSECRET'],
        {
            expiresIn: "15mins"
        }
    )
    return accessToken;
}

const verifyToken = async (req,res,next) =>{
    try{
        const  token= req.body.token || req.query.token || req.headers['authorization'];
        if(!token)return res.status(401).json(ErrorMeessage("A token authentication is needed"));
        let newToken= token.slice(7,token.length);
        verify(newToken, process.env['JWTSECRET']);
    }catch(err){
        next(err)
    }
    return next();
    
}

const verifyRefreshToken= async (req,res,next)=>{
    try{
        const  token= req.body.token || req.query.token || req.headers['authorization'];
        if(!token)return res.status(401).json(ErrorMeessage("A token authentication is needed"));
        let newToken= token.slice(7,token.length);
        verify(newToken, process.env['JWTREFRESHTOKEN']);
    }catch(err){
        next(err)
    }
    return next();
}


const decryptToken = async(req,res,next)=>{
    
    try{
        let token= req.headers['authorization'];

        
        let codeBreakdown= await jwtDecode(token);
        
        req.body['id']=codeBreakdown.id;
        req.user={
            userId: codeBreakdown.id,
            userName:codeBreakdown.username,
            userRole:codeBreakdown.userRole
        };
        return next()
    }catch(e){
        next(e)
    }
    
}


module.exports= { createToken, createEmailToken, verifyToken, decryptToken, createRefreshToken,verifyRefreshToken };
