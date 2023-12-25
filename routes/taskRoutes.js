const express= require('express');
const {verifyToken, decryptToken}= require('../Middleware/JWT')
const {handleCreateTask, retrieveAllUserTasks, retrievOneUserTask, handleUpdateOneUserTask, handleUpdateTaskStatus, handleAssignToUser, handleDeleteTask, handleRetriveAllTasks}= require('../Controller/taskRequest');
const {paginationMiddleware} = require('../Middleware/paginationMiddleware')
const {restrictToTaskWorker, restrictToTaskManagerAndWorker, restrictToTaskManager}= require('../Middleware/role-authorize')

const taskRouter= express.Router();

taskRouter.post('/createTask', verifyToken, decryptToken, restrictToTaskManager,handleCreateTask );
taskRouter.get('/retrieveAllUserTasks', verifyToken,decryptToken,paginationMiddleware,restrictToTaskManagerAndWorker,retrieveAllUserTasks);
taskRouter.get('/retriveUserTask/:taskId', verifyToken,decryptToken, restrictToTaskManagerAndWorker,retrievOneUserTask);
taskRouter.get('/retriveAllTasks', verifyToken,decryptToken,paginationMiddleware,restrictToTaskManager,handleRetriveAllTasks);
taskRouter.patch('/updateTask/:taskId', verifyToken,decryptToken,restrictToTaskManager,handleUpdateOneUserTask);
taskRouter.patch('/updateTaskStatus/:taskId',verifyToken,decryptToken, restrictToTaskManagerAndWorker,handleUpdateTaskStatus);
taskRouter.patch('/assignTaskTo/:taskId', verifyToken,decryptToken,restrictToTaskManager, handleAssignToUser);
taskRouter.delete('/deleteTask/:taskId', verifyToken,decryptToken,restrictToTaskManager,handleDeleteTask);





module.exports=taskRouter;