function validateFieldNotNull(value){
    
    return value!== null && value !== undefined && value.trim() !== '';
}

function noNullKeyValues(data){
    for (property in data){
        if(data.hasOwnProperty(property) && data[property]===null){
            return false;
        }
    }
    return true;
}

module.exports={validateFieldNotNull,noNullKeyValues};