const express= require('express');
const {verifyToken, decryptToken}= require('../Middleware/JWT')
const {handleCreateTask, retrieveAllUserTasks, retrievOneUserTask, handleUpdateOneUserTask, handleUpdateTaskStatus}= require('../Controller/taskRequest');
const {paginationMiddleware} = require('../Middleware/paginationMiddleware')
const {restrictToTaskCreator}= require('../Middleware/role-authorize')

const taskRouter= express.Router();

taskRouter.post('/createTask', verifyToken, decryptToken, handleCreateTask );
taskRouter.get('/retrieveAllUserTasks', verifyToken,decryptToken,paginationMiddleware,restrictToTaskCreator,retrieveAllUserTasks);
taskRouter.get('/retriveUserTask/:taskId', verifyToken,decryptToken,retrievOneUserTask);
taskRouter.patch('/updateTask', verifyToken,decryptToken,handleUpdateOneUserTask);
taskRouter.patch('/updateTaskStatus',verifyToken,decryptToken,handleUpdateTaskStatus);
//taskRouter.delete('/deleteTask', verifyToken,decryptToken,hand)



module.exports=taskRouter;