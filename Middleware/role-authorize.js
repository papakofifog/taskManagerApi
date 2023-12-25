const { ErrorMeessage } = require("../util/manageResponses");

const restrict = (req,res,next)=>{
    try{
        const userRoles = req.user.userRole;
            
        if(!userRoles.some((r)=> req.user.expectedUser.includes(r))){
            return res.status(401).json(ErrorMeessage("User not authorized"));
        }
        return next();
    }catch(e){
        return next(e);
    }
};

function restrictToTaskWorker(req, res, next){
    req.user={
        ...req.user,expectedUser: ['taskWorker']
    }
    return restrict(req,res,next);
    
}

function restrictToTaskManager(req, res, next){
    req.user={
        ...req.user,expectedUser: ['taskManager']
    }
    return restrict(req,res,next);
    
}

function restrictToTaskManagerAndWorker(req,res, next){
    req.user={
        ...req.user,expectedUser: ['taskManager','taskWorker']
    }
    return restrict(req,res,next);
    
}

module.exports= {restrictToTaskWorker,restrictToTaskManager,restrictToTaskManagerAndWorker}