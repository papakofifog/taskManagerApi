const express= require('express');
const { verifyRefreshToken, decryptToken }= require('../Middleware/JWT');
const {registerUser, loginUserWithJWT, getNewAccessToken}= require("../Controller/applicationRequest");


const ApplicationRouter= express.Router();

ApplicationRouter.post('/register', registerUser);
ApplicationRouter.post('/login', loginUserWithJWT);
ApplicationRouter.get('/refreshToken', verifyRefreshToken,decryptToken,getNewAccessToken)

module.exports= ApplicationRouter;
