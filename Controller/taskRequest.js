const {createNewTask,getAllUserTasks,getOneUserTask,updateOneTask, updateTaskStatus, deleteTask, filterUserTaskPerCriteria}=require('../Module/taskModule');
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
        let existingUserTask= await getOneUserTask(req.body.id);
        if(updateOneTask(req.body, next)) return res.json(successMessageWithData("Task updated", existingUserTask));
        return res.status(400).json(ErrorMeessage("Task updated failed"));
    }catch(e){
        return next(e);
    }
}

async function handleUpdateTaskStatus(){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        if(updateTaskStatus(req.body, next))return res.json(successMessageWithData("Task status updated", updateOneTask));
        return res.status(400).json(ErrorMeessage("Task status updated failed"));
    }catch(e){
        return next(e);
    }


}

async function handleDeleteTask(req,res, next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        if(deleteTask(req.body,next)) return res.status(400).json(successMessage("Task deleted"));
        return res.status(400).json(ErrorMeessage("Task deletion failed."));
    }catch(e){
        return next(e);
    }
}

async function handleFilterUserTaskPerCriteria(req, res, next){
    try{
        let existingUserId=await checkIfUserExists(req.body['id']);
        if(existingUserId === null) return res.json(ErrorMeessage("User does not exist"));
        let filteredUserTasks= await filterUserTaskPerCriteria(req.body['id'], req.body.filterStatus, req.body.filterDueDate, next);
        return res.status(200).json(successMessageWithData("filtered User tasks",filteredUserTasks));
    }catch(e){
        return next(e);
    }
}



module.exports={handleCreateTask, retrieveAllUserTasks, retrievOneUserTask, handleUpdateOneUserTask, handleUpdateTaskStatus, handleDeleteTask, handleFilterUserTaskPerCriteria};