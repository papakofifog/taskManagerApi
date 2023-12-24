const mongoose= require('mongoose');
const mongoosePaginate= require('mongoose-paginate');


const taskSchema= new mongoose.Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required:(true, "user reference is required")
    },
    title:{
        type: String,
        required: [true, "Title field is required"]
    },
    description:{
        type:String,
        
    },
    dueDate:Date,
    status: {
        type: String,
        enum:['PENDING','INPROGRESS', 'COMPLETED']
    }
}, {timestamps:true})

taskSchema.plugin(mongoosePaginate);


const taskModel= mongoose.model('taskModel', taskSchema);

const createNewTask = async (newTask, next)=>{
    try{
        let expectedTask={
            "userId":newTask.id,
            "title":newTask.title,
            "description": newTask.description,
            "dueDate": newTask.dueDate,
            "status":newTask.status
        }
        let newTaskDocument= new taskModel({
            ...expectedTask
        });
        let newTaskCreated=await newTaskDocument.save();
        return newTaskCreated;
    }catch(e){
        return next(e);
    }
}

const getAllUserTasks = async (userId, next) =>{
    try{
        let usersTasks= await taskModel.find({userId: userId}).sort('-createdAt');
        return usersTasks;
    }catch(e){
        next(e);
    }
}

const getOneUserTask = async (taskId, next) =>{
    try{
        let userTask= await taskModel.findOne({_id:taskId});
        return userTask;

    }catch(e){
        next(e);
    }
}

const updateOneTask= async (task, next) =>{
    try{
        let {id, title, description, dueDate, status }= task;
        let userTask= await taskModel.updateOne({_id:id}, {
            title: title,
            decription:description,
            dueDate: dueDate,
            status: status
        });
        return userTask.acknowledged;
    }catch(e){
        next(e);
    }
}

const updateTaskStatus=async (task, next)=>{
    try{
        let {id, taskStatus }= task;
        let userTask= await taskModel.updateOne({_id:id}, {
            status: taskStatus
        });
        return userTask.acknowledged;
    }catch(e){next(e)}
}

const deleteTask = async (taskId, next)=> {
    try{
        let userTask= await taskModel.deleteOne({_id:taskId});
        return userTask.acknowledged;
    }catch(e){next(e)}
}

const filterUserTaskPerCriteria = async (userId, filterStatus, filterDueDate, next)=>{
    try{
        let tasks= await taskModel.find({_id:userId}, {status:filterStatus, dueDate:filterDueDate}).sort('-createdAt');
        return tasks;
    }catch(e){
        next(e);
    }
}

module.exports= {createNewTask,getAllUserTasks,getOneUserTask,updateOneTask, updateTaskStatus, deleteTask, filterUserTaskPerCriteria}





