const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const db = require("../../database/database.js")
const id_grab = require("../../middlewares/user_id_grab.js")

var userid
router.use((request, response, next) => {
    //
   userid = id_grab.getid(request.header("Authorization"));
    next();
  });


router.post("/send_message", (request, response) => { // Kullanıcının başka bir kullanıcıya mesaj göndermesi için

    if(!request.body.message || !request.body.userid) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    const date = new Date();
    const finaldate = new Date().toLocaleString('tr-tr')

    var query = `INSERT INTO private_message(message,senderid,receiverid,Date) VALUES(?,${userid},?,"${finaldate}")`
    db.query(query,[request.body.message,request.body.userid], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        return response.end(`{"error":false,"message":"Mesaj gönderildi"}`)

    })

})

router.get("/dmbox", (request, response) => { // kullanıcı dm kutusuna tıkladığında daha önce mesajlaştığı insanları görecek

    var query = `SELECT DISTINCT CASE WHEN users.id = ${userid} 
    THEN IF(users.id = private_message.senderid, private_message.receiverid, private_message.senderid) 
    ELSE users.id END AS userid,  CASE  WHEN users.id = ${userid} 
    THEN IF(users.id = private_message.senderid, receiver.name, sender.name) ELSE users.name END AS name, CASE 
    WHEN users.id = ${userid} THEN IF(users.id = private_message.senderid, receiver.avatarUrl, sender.avatarUrl) 
    ELSE users.avatarUrl END AS avatarUrl, MIN(private_message.id) AS messageid 
    FROM private_message 
    JOIN users AS sender ON private_message.senderid = sender.id 
    JOIN users AS receiver ON private_message.receiverid = receiver.id 
    LEFT JOIN users ON (users.id = private_message.senderid OR users.id = private_message.receiverid) 
    WHERE (private_message.senderid = ${userid} OR private_message.receiverid = ${userid}) AND users.id != ${userid} 
    GROUP BY LEAST(private_message.senderid, private_message.receiverid), 
    GREATEST(private_message.senderid, private_message.receiverid) 
    ORDER BY private_message.Date DESC 
    LIMIT 20; `
    db.query(query, function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0) return response.end(`{"error":true,"message":"Gösterilecek mesaj bulunamadı"}`)

        return response.end(JSON.stringify(result))

    })

})

router.get("/get_message", (request, response) => { // Kullanıcı dm kutusundan bir kişiye tıkladığında o kişiyle olan mesajlarını çekiyoruz

    if(!request.query.userid) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    var query = `SELECT private_message.*, users.id AS userid, users.name, users.avatarUrl, 
    IF(private_message.senderid = ${userid}, true, false) AS hasOwn 
    FROM private_message 
    INNER JOIN users ON users.id = private_message.senderid 
    WHERE (private_message.senderid = ${userid} OR private_message.receiverid = ${userid}) AND (private_message.receiverid = ? OR private_message.senderid = ?) 
    ORDER BY private_message.Date DESC limit 20`
    db.query(query,[request.query.userid,request.query.userid], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0) return response.end(`{"error":true,"message":"Hiç mesaj bulunamadı"}`)

        return response.end(JSON.stringify(result))

    })

})

router.get("/delete_message", (request, response) => { // Kullanıcı gönderdiği mesajı silmek isterse

    if(!request.query.messageid) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    var query = `DELETE FROM private_message WHERE id = ? AND senderid = ${userid}`
    db.query(query,[request.query.messageid], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        return response.end(`{"error":false,"message":"Mesajı sildiniz"}`)

    })

})



module.exports = router