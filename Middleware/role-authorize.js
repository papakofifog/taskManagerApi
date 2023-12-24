const { ErrorMeessage } = require("../util/manageResponses");

const restrict = (...role)=>{
    try{
        return (req, res,next)=>{
            console.log(req.user)
            const userRoles = req.user.userRole;
            if(!userRoles.some((r)=> role.includes(r))){
                return res.status(401).json(ErrorMeessage("User not authorized"));
            }
            next();
        };
    }catch(e){
        return next(e);
    }
};

function restrictToTaskCreator(req, res, next){
    restrict(['taskCreator']);
    next();
}

function restrictToTaskManager(req, res, next){
    restrict(['taskManager']);
    next();
}

function restrictToTaskManagerAndCreator(req,res, next){
    restrict(['taskCreator','taskManager']);
    next()
}

module.exports= {restrictToTaskCreator,restrictToTaskManager,restrictToTaskManagerAndCreator}