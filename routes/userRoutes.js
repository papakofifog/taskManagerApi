const express= require('express');
const {verifyToken, decryptToken}= require('../Middleware/JWT');
const {getActiveUser, updateActiveUser, handleGetAllUsers}= require("../Controller/userRequest");
const { restrictToTaskManagerAndWorker, restrictToTaskManager } = require('../Middleware/role-authorize');
const { paginationMiddleware } = require('../Middleware/paginationMiddleware');


const UserRoutes= express.Router();



UserRoutes.get("/activeUser", verifyToken, decryptToken, restrictToTaskManagerAndWorker, getActiveUser);
UserRoutes.patch("/updateActiveUser", verifyToken, decryptToken, restrictToTaskManagerAndWorker, updateActiveUser );
UserRoutes.get("/getAllUsers", verifyToken,decryptToken,paginationMiddleware,restrictToTaskManager, handleGetAllUsers);

module.exports= UserRoutes;

