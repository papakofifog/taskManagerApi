const {getOneUser,updateUsername, getAllUsers}= require('../Module/userModule');
const {successMessageWithData} = require("../util/manageResponses");


async function getActiveUser(req, res, next){
    try{
        let user= await getOneUser(req.body['id'], next);
        res.json(successMessageWithData("Active User data",user));
    }catch(e){
        next(e)
    }
}

async function updateActiveUser(req, res, next){
    try{
        let isUserUpdated= await updateUsername(req.body, next);
        if (!(isUserUpdated)) return res.json("Update Active User details failed");
        let user= await getOneUser(req.body.id, next);

        return res.status(200).json({
            "message":"Update Successfull",
            "data": user
        })
    }catch(e){
        next(e);
    }
}


async function handleGetAllUsers(req, res, next){
    try{
        let {startIndex, endIndex}= req.pagination;
        let users=await getAllUsers(next);
        if(users)return res.json(successMessageWithData("All users are", {paginatedData:users.slice(startIndex,endIndex), total:users.length}))
        return users;
    }catch(e){
        return next(e);
    }
    
}

module.exports= {getActiveUser, updateActiveUser, handleGetAllUsers}








