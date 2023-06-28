const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const db = require("../../database/database.js")
const id_grab = require("../../middlewares/user_id_grab.js")
var hashing = require('crypto') // Burda rastgele string üretmek için kullanıldı (resim upload)
const fileUpload = require('express-fileupload'); // kullanıcının fotoğraf yüklemesi için
const path = require("path"); // şuanki içinde olduğumuz dizinin adresini alır

var userid
router.use((request, response, next) => {
    //
   userid = id_grab.getid(request.header("Authorization"));
    next();
  });

router.post("/upload_post", (request, response) => { // kullanıcı gönderi yükler

    if (!request.files?.image || !request.body.comment) return response.end(`{"error":true,"message":"Bilgileri eksik girdiniz"}`)

    const image = request.files.image;

    image.name = hashing.randomBytes(16).toString('hex')+".jpg" // resime random isim ver ve uzantısını jpg yap

    const writePath = __dirname + `/../../../../public/uploads/images/posts/${image.name}`;

    image.mv(writePath, (err) => { // resmi dizine yaz

        if (err) return response.end(`{"error":true,"message":"Bir hata oluştu"}`)
          
        const date = new Date();
        const finaldate = new Date().toLocaleString('tr-tr')

        var query = `INSERT INTO posts(userId,comment,likes,imageUrl,timestamp,createDate) 
        VALUES(${userid},?,0,"/uploads/images/posts/${image.name}",${Date.now()},"${finaldate}")`
        db.query(query,[request.body.comment],function (err, result) {
            if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

            return response.end(`{"error":false,"message":"Gönderi oluşturuldu}`)

        })
        
        
      });


})

router.get("/delete_post", (request, response) => { // kullanıcı kendi gönderisini silmek istediğinde

    if(!request.query.postid) return response.end(`{"error":true,"message":"Bilgileri eksik girdiniz"}`)

    var query = `DELETE FROM posts WHERE id = ? AND userId = ${userid}`
    db.query(query,[request.query.postid],function (err, result) {

        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        return response.end(`{"error":false,"message":"Gönderiyi sildiniz}`) // Saldırgan arkadaş başkasının gönderisini silebiliyorum sansın ve biraz sevinsin :D

    })

});

router.get("/like_post", (request, response) => { // kullanıcı bir gönderiyi beğenmek istediğinde

    if(!request.query.postid) return response.end(`{"error":true,"message":"Bilgileri eksik girdiniz"}`)

    var query = `SELECT id FROM post_likes WHERE liker_user_id = ${userid} AND postid = ? limit 1`
    db.query(query,[request.query.postid],function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0){ // kullanıcı gönderiyi daha önce beğenmediyse, gönderiyi beğenir
            var query2 = `UPDATE posts SET likes = likes+1 WHERE id = ?; INSERT INTO post_likes(postid,liker_user_id) VALUES(?,${userid})`
            db.query(query2,[request.query.postid,request.query.postid],function (err, result) {
                if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

                return response.end(`{"error":false,"message":"Gönderiyi beğendiniz"}`)
            });
        }
        else{ // daha önce beğendiyse gönderiyi unlike eder
            var query2 = `UPDATE posts SET likes = likes-1 WHERE id = ?; DELETE FROM post_likes WHERE postid = ? AND liker_user_id = ${userid}`
            db.query(query2,[request.query.postid,request.query.postid],function (err, result) {
                if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

                return response.end(`{"error":false,"message":"Gönderiyi beğenmekten vazgeçtiniz"}`)

            })
        }

    })

});


router.post("/comment_post", (request, response) => { // kullanıcı bir gönderiye yorum eklemek isterse

    if(!request.body.postid || !request.body.comment) return response.end(`{"error":true,"message":"Bilgileri eksik girdiniz"}`)
    if(request.body.comment.length >= 119) return response.end(`{"error":true,"message":"Yorum alanına en fazla 120 karakter girebilirsiniz"}`)

    const date = new Date();
    const finaldate = new Date().toLocaleString('tr-tr')

    var query = `INSERT INTO post_comments(commenter_id,postid,comment,date) VALUES(${userid},?,?,"${finaldate}")`
    db.query(query,[request.body.postid,request.body.comment],function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        return response.end(`{"error":false,"message":"Gönderiye yorum yaptınız"}`)

    })

});

router.get("/delete_comment", (request, response) => { // Kullanıcı gönderiye yaptığı yorumu silmek isterse

    if(!request.query.commentid || !request.query.postid) return response.end(`{"error":true,"message":"Bilgileri eksik girdiniz"}`)

    var query = `DELETE FROM post_comments WHERE id = ? AND postid = ? AND commenter_id = ${userid}`
    db.query(query,[request.query.commentid,request.query.postid],function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        return response.end(`{"error":false,"message":"Yorumu sildiniz"}`)

    })

})


router.get("/posts", (request, response) => { // gönderiye tıklandığında gelecek gönderi bilgileri

    if(!request.query.offset) return response.end(`{"error":true,"message":"Bilgileri eksik girdiniz"}`)

    try{
    request.query.offset = parseInt(request.query.offset);
    }
    catch(err){
        return response.end(`{"error":true,"message":"Tam sayı giriniz"}`)
    }
    if(request.query.offset <10) return response.end(`{"error":true,"message":"Limit değeri 10 veya üstü olmalıdır"}`)

    var query = `SELECT posts.*, users.name, users.avatarUrl,(CASE WHEN post_likes.liker_user_id IS NOT NULL THEN true ELSE false END) AS didLike, 
    COUNT(post_comments.postid) AS comment_count 
    FROM posts 
    JOIN users ON posts.userId = users.id LEFT JOIN post_likes ON post_likes.postid = posts.id AND post_likes.liker_user_id = ${userid} 
    LEFT JOIN post_comments ON post_comments.postid = posts.id 
    GROUP BY posts.id 
    ORDER BY posts.timestamp DESC LIMIT ${request.query.offset-10}, ${request.query.offset} `
    db.query(query,function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0) return response.end(`{"error":true,"message":"Gösterilecek gönderi bulunamadı"}`)

        for(var i=0;i<result.length;i++){ // gelen gönderiler kullanıcının mı diye bakıyoruz
            
            if(result[i].userId == userid) result[i]["hasOwn"] = true
            else result[i]["hasOwn"] = false

        }
        
        return response.end(JSON.stringify(result))

    })

});


router.get("/post", (request, response) => { // kullanıcı tek bir gönderiye tıkladığında o gönderinin bilgilerini çekiyoruz

    if(!request.query.postid) return response.end(`{"error":true,"message":"Bilgileri eksik girdiniz"}`)

    var query = `SELECT posts.*, users.name, users.avatarUrl, 
    (CASE WHEN post_likes.liker_user_id IS NOT NULL THEN true ELSE false END) AS didLike, 
    COUNT(post_comments.postid) AS comment_count 
    FROM posts 
    JOIN users ON posts.userId = users.id 
    LEFT JOIN post_likes ON post_likes.postid = posts.id AND post_likes.liker_user_id = ${userid} 
    LEFT JOIN post_comments ON post_comments.postid = posts.id 
    WHERE posts.id = ? GROUP BY posts.id `
    db.query(query,[request.query.postid],function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0) return response.end(`{"error":true,"message":"Gönderi bulunamadı"}`)

        if(result[0]?.userId == userid) result[0]["hasOwn"] = true
        else result[0]["hasOwn"] = false

        return response.end(JSON.stringify(result[0]))

    })

});

router.get("/get_post_likes", (request, response) => {  // gönderiyi kimler beğenmiş onu çekiyoruz

    if(!request.query.postid) return response.end(`{"error":true,"message":"Bilgileri eksik girdiniz"}`)

    var query = `SELECT post_likes.liker_user_id,users.name,users.id AS userid,users.avatarUrl FROM post_likes INNER JOIN users ON post_likes.liker_user_id = users.id WHERE post_likes.postid = ?`
    db.query(query,[request.query.postid],function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0) return response.end(`{"error":true,"message":"Bu gönderiyi kimse beğenmemiş"}`)

        return response.end(JSON.stringify(result))
    })

})


router.get("/get_post_comments", (request, response) => { // Gönderinin yorumlarını getiriyoruz

    if(!request.query.postid) return response.end(`{"error":true,"message":"Bilgileri eksik girdiniz"}`)

    var query = `SELECT post_comments.*, users.name, users.avatarUrl 
    FROM post_comments 
    INNER JOIN users ON post_comments.commenter_id = users.id 
    WHERE post_comments.postid = ?`
    db.query(query,[request.query.postid],function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0) return response.end(`{"error":false,"message":"Bu gönderiye henüz yorum yapan olmamış"}`)

        for(var i=0;i<result.length;i++){
            if(result[i].commenter_id == userid) result[i]["hasOwn"] = true
            else result[i]["hasOwn"] = false
        }

        return response.end(JSON.stringify(result))

    })


})

module.exports = router
