const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const db = require("../../database/database.js")


router.get("/version_control", (request, response) => {

    if(!request.query.device || !request.query.version) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    var query = `SELECT latest_version FROM version_control WHERE device = ? order by id DESC limit 1`
    db.query(query,[request.query.device,request.query.version], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(request.query.version < result[0]?.latest_version) return response.end(`{"error":true,"message":"Uygulama güncel değil!"}`)
        else if(result.length == 0) return response.end(`{"error":true,"message":"Uygulama güncel değil!"}`)
        
        return response.end(`{"error":false,"message":"Uygulama güncel"}`)

    })

});

module.exports = router