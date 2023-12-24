function successMessageWithData(message,data){
    return {
        "message": message,
        "data":data
    }
}

function successMessage(message){
    return {
        "message": message
    }
}

function failureMessage(message){
    return{
        "errors":[
            {
                "message": message
            }
        ]
        
    }
}


function ErrorMeessage(errors){
    return {
        "errors": errors
    }
}

function loginSuccessMessage(message,token,refreshToken){
    return {
        "message":message,
        "token":token,
        "refreshToken":refreshToken,
    }
}

module.exports= {successMessage,successMessageWithData,failureMessage, ErrorMeessage,loginSuccessMessage}