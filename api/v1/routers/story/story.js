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


router.post("/upload_story", (request, response) => { // hikaye yükleme

    if (!request.files?.image || !request.body.comment) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    const image = request.files.image;

    image.name = hashing.randomBytes(16).toString('hex')+".jpg" // resime random isim ver ve uzantısını jpg yap

    const writePath = __dirname + `/../../../../public/uploads/images/stories/${image.name}`;

    image.mv(writePath, (err) => { // resmi dizine yaz
        if (err) return response.end(`{"error":true,"message":"Bir hata oluştu"}`)
          
        const date = new Date();
        const finaldate = new Date().toLocaleString('tr-tr')

        var query = `INSERT INTO stories(userid,comment,likes,photoUrl,timestamp,createDate) 
        VALUES(${userid},?,0,"/uploads/images/stories/${image.name}",${Date.now()},"${finaldate}")`
        db.query(query,[request.body.comment], function (err, result) {
            if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

            return response.end(`{"error":false,"message":"Hikaye eklediniz"}`)

        })
        
        
      });

});

router.get("/delete_story", (request, response) => { // hikaye silme

    if(!request.query.storyid) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    var query = `DELETE FROM stories WHERE id = ? AND userid = ${userid}`
    db.query(query,[request.query.storyid], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        return response.end(`{"error":false,"message":"Hikayeyi sildiniz"}`) // Saldırgan arkadaş başkasının hikayesini silebiliyorum sansın ve biraz sevinsin :D

    })

});

router.get("/show_stories", (request, response) => { // anasayfada hikayeleri gösterme

    var query = `SELECT stories.*, users.name, users.avatarUrl 
    FROM stories 
    JOIN users ON stories.userid = users.id  
    LEFT JOIN story_seen ON stories.id = story_seen.storyid AND users.id = story_seen.userid 
    WHERE (stories.timestamp + 86400000) > ${Date.now()} AND (story_seen.storyid IS NULL OR story_seen.userid IS NULL) AND stories.userid != ${userid} 
    ORDER BY stories.timestamp DESC LIMIT 10;` // Eğer hikaye yükleneli 24 saati geçmişse veya kullanıcı o hikayeyi daha önce görmüşse o hikayeyi göstermiyoruz
    db.query(query, function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0) return response.end(`{"error":true,"message":"Gösterilecek hikaye bulunamadı"}`)

        return response.end(JSON.stringify(result))

    })


});


router.get("/show_story", (request, response) => { // Kullanıcı bir hikayeye tıkladığında o hikayeyi getirme

    if(!request.query.storyid || request.query.storyid === undefined) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    var query = `SELECT * FROM story_seen WHERE userid = ? AND storyid = ?`

    var query2 = `SELECT stories.*, users.name, users.avatarUrl, 
    IF(story_likes.liker_id IS NULL, false, true) as didLike 
    FROM stories 
    JOIN users ON stories.userid = users.id 
    LEFT JOIN story_likes ON story_likes.story_id = stories.id AND story_likes.liker_id = ? 
    WHERE stories.id = ? limit 1;`
    //
    db.query(query,[userid,request.query.storyid], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0){
            var query3 = `INSERT INTO story_seen(userid,storyid) VALUES(?,?)`
            db.query(query3,[userid,request.query.storyid], function (err, result) {
                if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)
            })

        }

    db.query(query2,[userid,request.query.storyid], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0) response.end(`{"error":true,"message":"Hikaye bulunamadı"}`)

        var res = result

        var addtoresult = 0

        if(result[0]?.userid == userid){
            var querycountget = `SELECT COUNT(id) FROM story_seen WHERE storyid = ?`
            db.query(querycountget,[request.query.storyid], function (err, result) {
                if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)
                
                if(result.length != 0){

                
                addtoresult = result[0]["COUNT(id)"]

                res[0]["story_view_counter"] = addtoresult
                res[0]["hasOwn"] = true
                return response.end(JSON.stringify(res[0]))
            }
            })
        }
        else{ 
            result[0]["hasOwn"] = false
            return response.end(JSON.stringify(result[0]))
        
        }
        
    })

})

});

router.get("/like_story", (request, response) => { // Kullanıcı hikaye beğenmek istediğinde

    if(!request.query.storyid) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    var query = `SELECT id FROM story_likes WHERE story_id = ? AND liker_id = ${userid} limit 1`
    db.query(query,[request.query.storyid], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0){ // kullanıcı daha önce hikayeyi beğenmediyse

            var query2 = `INSERT INTO story_likes(story_id,liker_id) 
            VALUES(?,${userid}); UPDATE stories SET likes = likes+1 WHERE id = ?`
            db.query(query2,[request.query.storyid,request.query.storyid], function (err, result) {
                if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

                return response.end(`{"error":false,"message":"Hikayeyi beğendiniz"}`)
            })

        }
        else{ // kullanıcı daha önce hikayeyi beğendiyse unlike ediyoruz

            var query3 = `DELETE FROM story_likes 
            WHERE story_id = ? AND liker_id = ${userid}; UPDATE stories SET likes = likes-1 WHERE id = ?`
            db.query(query3,[request.query.storyid,request.query.storyid], function (err, result) {
                if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

                return response.end(`{"error":false,"message":"Hikayeyi beğenmekten vazgeçtiniz"}`)

            })

        }


    })


});



module.exports = router