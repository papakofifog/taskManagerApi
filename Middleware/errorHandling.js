function handleValidationErrors(err){
    let pendingErrors= err.errors;
    let errors=[];
    for(let fieldName in pendingErrors){
        if(pendingErrors.hasOwnProperty(fieldName)){
            const fieldError = pendingErrors[fieldName];
            errors.push({
                "message":fieldError.properties.message,
                //"Path": fieldError.properties.path
            });
        }
    }
    return errors;
}

// e.g. "UNIQUE constraint failed: users.email" -> "email already taken"
function handleSqliteErrors(err){
    if(err.code !== 'SQLITE_CONSTRAINT_UNIQUE') return [];
    const column= err.message.split(':').pop().trim().split('.').pop();
    return [{"message": `${column} already taken`}];
}



function handleErrors(err,req,res,next){

    let errorName= err.name;
    let errors=[];
    console.log(errorName)
    console.error(err)
    switch(errorName){
        case "ValidationError":
            errors=handleValidationErrors(err);
            break;
        case "SqliteError":
            errors=handleSqliteErrors(err)
    }
   return res.status(400).send({
    "data": {
        errors
    }

   })
};

module.exports= handleErrors;