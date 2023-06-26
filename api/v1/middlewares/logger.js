const db = require("../database/database.js")
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")


// Logger middleware
const loggerMiddleware = (request, response, next) => {
    const { method, url, headers } = request;

    var path = ""

    const date = new Date();
    const finaldate = new Date().toLocaleString('tr-tr')

    let bodyData = null
    if (method == 'POST') {
      bodyData = request.body;
    }
  
    const logData = {
      method,
      url,
      headers: JSON.stringify(headers),
      body: JSON.stringify(bodyData)
    };

    path = request.path
  
    // Log verilerini veritabanına kaydet
    var query = `INSERT INTO logs(path,body,Date,request_type,headers) VALUES(?,?,"${finaldate}",?,?)`
    db.query(query,[path,logData.body,logData.method,logData.headers], function (err, result) {


    })
  
    next();
  };

  
  module.exports = loggerMiddleware;