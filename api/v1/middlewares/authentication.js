const db = require("../database/database.js")
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")


const authenticateToken = (request, response, next) => {
let tokenHeaderKey = "Authorization";
  
    try {
        const token = request.header(tokenHeaderKey);
  
        const verified = jwt.verify(token, process.env.SECRETKEY);
        if(verified){
            next()
        }else{
            // Access Denied
            return response.status(401).end(`{"error":true,"message":"Tekrar giriş yapın"}`)
        }
    } catch (error) {
        // Access Denied
        return response.status(401).end(`{"error":true,"message":"Tekrar giriş yapın"}`)
    }

}


module.exports = authenticateToken
