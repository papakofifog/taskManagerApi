const mongoose= require('mongoose');
const mongoosePaginate= require('mongoose-paginate');


const taskSchema= new mongoose.Schema({
    createdBy:{
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
        type: [String],
        enum:['PENDING','INPROGRESS', 'COMPLETED']
    },
    assignedTo:{
        type: String,
        ref: 'User',
        default: ''
    }
}, {timestamps:true})

taskSchema.plugin(mongoosePaginate);


const taskModel= mongoose.model('taskModel', taskSchema);

const createNewTask = async (newTask, next)=>{
    try{
        let expectedTask={
            "createdBy":newTask.id,
            "title":newTask.title,
            "description": newTask.description,
            "dueDate": newTask.dueDate,
            "status":newTask.status,
            "role": newTask?.role||"",
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
        let usersTasks= await taskModel.find({createdBy: userId}).sort('-createdAt');
        return usersTasks;
    }catch(e){
        next(e);
    }
}

const getAllTasks = async (next)=>{
    try{
        let allTasks= await taskModel.find().sort('-createdAt');
        return allTasks;
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
        let {taskId, title, description, dueDate, status }= task;
        let userTask= await taskModel.updateOne({_id:taskId}, {
            title: title,
            decription:description,
            dueDate: dueDate,
            status: status,
        });
        console.log(userTask.matchedCount)
        return userTask.modifiedCount;
    }catch(e){
        next(e);
    }
}

const updateTaskStatus=async (task, next)=>{
    try{
        let {taskId, status }= task;
        console.log(task)
        let userTask= await taskModel.updateOne({_id:taskId}, {
            status: status
        });
        return userTask.modifiedCount;
    }catch(e){next(e)}
}

const deleteTask = async (taskId, next)=> {
    try{
        let userTask= await taskModel.deleteOne({_id:taskId});
        return userTask.deletedCount;
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

const assignTaskTo= async (data, next)=>{
    try{
        let {taskId,userAssignedTo }= data;
        let userTask= await taskModel.updateOne({_id:taskId}, {
            assignTaskTo: userAssignedTo
        });
        return userTask.acknowledged();
    }catch(e){
        return next(e);
    }
}



module.exports= {createNewTask,
    getAllUserTasks,
    getOneUserTask,
    updateOneTask,
    updateTaskStatus,
    deleteTask,
    filterUserTaskPerCriteria,
    assignTaskTo,
    getAllTasks
}





