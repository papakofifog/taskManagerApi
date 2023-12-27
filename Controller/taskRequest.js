const {createNewTask,getAllUserTasks,getOneUserTask,updateOneTask, updateTaskStatus, deleteTask, filterUserTaskPerCriteria, assignTaskTo, getAllTasks}=require('../Module/taskModule');
const { successMessage, successMessageWithData, ErrorMeessage } = require('../util/manageResponses');
const {checkIfUserExists}= require('../Module/userModule')



async function handleCreateTask(req, res, next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        let newTaskDocument= await createNewTask(req.body, next);

        if((newTaskDocument)){
            return res.json(successMessageWithData("Task Created", newTaskDocument))
        }
    }catch(e){
        return next(e)
    }

}

async function retrieveAllUserTasks(req, res, next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        const { startIndex, endIndex} = req.pagination;
        let allUserTasks= await getAllUserTasks(req.body['id'], next);
        let paginatedData= allUserTasks.slice(startIndex,endIndex);
        return res.json(successMessageWithData("Users tasks are", {paginatedData, total: paginatedData.length}));
    }catch(e){
        return next(e);
    }
    
}

async function retrievOneUserTask(req,res,next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        let userTask= await getOneUserTask(req.params.taskId,next);
        return res.json(successMessageWithData("Tasks,",userTask));
    }catch(e){
        return next(e);
    }
}

async function handleUpdateOneUserTask(req, res, next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        let existingUserTask= await getOneUserTask(req.body.id, next);
        req.body.taskId=req.params.taskId;
        let userTask= await updateOneTask(req.body, next);
        if(userTask) return res.json(successMessageWithData("Task updated", existingUserTask));
        return res.status(400).json(ErrorMeessage("Task updated failed"));
    }catch(e){
        return next(e);
    }
}

async function handleUpdateTaskStatus(req, res, next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        req.body.taskId=req.params.taskId;
        let isTaskUpdated= await updateTaskStatus(req.body,next);
        if(isTaskUpdated)return res.json(successMessageWithData("Task status updated", updateOneTask));
        return res.status(400).json(ErrorMeessage("Task status updated failed"));
    }catch(e){
        return next(e);
    }


}

async function handleDeleteTask(req,res, next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        let isTaskDeleted= await deleteTask(req.params.taskId,next);
        console.log( isTaskDeleted);
        if(isTaskDeleted) return res.status(200).json(successMessage("Task deleted"));
        return res.status(400).json(ErrorMeessage("Task deletion failed."));
    }catch(e){
        return next(e);
    }
}

async function handleFilterUserTaskPerCriteria(req, res, next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        let filteredUserTasks= await filterUserTaskPerCriteria(req.body['id'], req.body.status, req.body.dueDate, next);
        if(filteredUserTasks == null) return res.json(ErrorMeessage("Failed to featch filtered user tasks"));
        return res.status(200).json(successMessageWithData("filtered User tasks",filteredUserTasks));
    }catch(e){
        return next(e);
    }
}


async function handleAssignToUser(req,res,next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        let taskToAssign={"taskId":req.params.taskId,userAssignedTo: req.body.userAssignedTo }
        let isTaskAssigned=await assignTaskTo(taskToAssign, next);
        if(isTaskAssigned) return res.json(successMessage("Task Assigned successfully"));
        return res.json(ErrorMeessage("Failed to assign task to user"));
    }catch(e){
        return next(e);
    }
}

async function handleRetriveAllTasks(req, res, next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        const { startIndex, endIndex} = req.pagination;
        let allTasks= await getAllTasks(next);
        if(allTasks) return res.json(successMessageWithData("Tasks are", {paginatedData:allTasks.slice(startIndex,endIndex), total: allTasks.length }));
        return res.json(ErrorMeessage("Cannot fetch all tasks at moment, kindly contact the taskApp team"));
    }catch(e){
        return next(e);
    }
}



module.exports={handleCreateTask, retrieveAllUserTasks, retrievOneUserTask, handleUpdateOneUserTask, handleUpdateTaskStatus, handleDeleteTask, handleFilterUserTaskPerCriteria, handleAssignToUser, handleRetriveAllTasks};