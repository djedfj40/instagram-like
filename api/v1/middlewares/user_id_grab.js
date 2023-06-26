const jwt = require("jsonwebtoken")


function getid(jwt_token){

    if(jwt_token === undefined || jwt_token === ""){
        return "error"
    }
    else{
try{
        const verified = jwt.verify(jwt_token, process.env.SECRETKEY)

        if(!verified) return "error"

        const decodedToken = jwt.decode(jwt_token,process.env.SECRETKEY);
        const userId = decodedToken.id
        return userId
}catch(err){

    return "error"
}


    }

}

module.exports = {getid}