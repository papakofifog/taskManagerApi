const express= require('express');
const {verifyToken, decryptToken}= require('../Middleware/JWT');
const {getActiveUser, updateActiveUser}= require("../Controller/userRequest");


const UserRoutes= express.Router();



UserRoutes.get("/activeUser", verifyToken, decryptToken, getActiveUser);
UserRoutes.patch("/updateActiveUser", verifyToken, decryptToken, updateActiveUser );

module.exports= UserRoutes;

