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


router.post("/change_profile", (request, response) => { // kullanıcı profil bilgilerini değiştirmek isterse (profil açıklaması ve kendi ismi gibi)

    if(!request.body.description || !request.body.name) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    var query = `UPDATE users SET profile_description = ? , name = ? WHERE id = ${userid}` 
    db.query(query, [request.body.description,request.body.name], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        return response.end(`{"error":false,"message":"Bilgileriniz başarıyla değiştirildi"}`)

    })

});

router.post("/upload_avatar", (request, response) => { 

    if (!request.files?.avatar) return response.end(`{"error":true,"message":"Lütfen bir resim seçiniz"}`)

    const image = request.files.avatar;

    image.name = hashing.randomBytes(16).toString('hex')+".jpg" // resime random isim ver ve uzantısını jpg yap

    const writePath = __dirname + `/../../../../public/uploads/images/user_avatars/${image.name}`;

    image.mv(writePath, (err) => { // resmi dizine yaz
        if (err) return response.end(`{"error":true,"message":"Bir hata oluştu"}`)
          
        var query = `UPDATE users SET avatarUrl = "/uploads/images/user_avatars/${image.name}" WHERE id = ${userid}`
        db.query(query, function (err, result) {
            if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

            return response.end(`{"error":false,"message":"Resminiz başarıyla yüklendi"}`)

        })
        
        
      });

})

router.get("/remove_avatar", (request, response) => { // kullanıcı resmini kaldırmak isterse cinsiyetine göre default avatara dönüyoruz

    var avatarUrl = ""
    var query = `SELECT sex FROM users WHERE id = ${userid}`
    db.query(query, function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result[0].sex == 1) avatarUrl = "/uploads/images/avatars/male.jpg"
        else avatarUrl = "/uploads/images/avatars/female.jpg"

        var query2 = `UPDATE users SET avatarUrl = "${avatarUrl}" WHERE id = ${userid}`
        db.query(query2, function (err, result) {
            if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

            return response.end(`{"error":false,"message":"Resminiz kaldırıldı"}`)

        })

    })


})


router.get("/delete_user", (request, response) => {  // kullanıcı hesabını silmek isterse. (aslında silmiyoruz devre dışı bırakıyoruz çaktırma :D)

    var query = `UPDATE users SET IsActive = 0 WHERE id = ${userid}`
    db.query(query, function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        return response.end(`{"error":false,"message":"Hesabınızı sildiniz. Yönlendiriliyorsunuz..."}`)

    })

});


router.get("/user_profile", (request, response) => { // Kullanıcı başka bir kullanıcının profiline tıkladığımızda

    if(!request.query.id) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    var query = `SELECT users.name,users.profile_description,users.avatarUrl 
    FROM users WHERE id = ?; SELECT * FROM posts WHERE userId = ?`
    db.query(query,[request.query.id,request.query.id], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)
        if(result[0].length == 0) return response.end(`{"error":true,"message":"Kullanıcı bulunamadı"}`)
        if(result[1].length == 0) return response.end(JSON.stringify(result[0][0]))

        // kullanıcının daha önce yüklediği gönderileri de getiriyoruz.
       var posts = JSON.stringify(result[1])
       
       posts = JSON.parse(posts)
       
       result[0][0].posts = posts
       
        return response.end(JSON.stringify(result[0][0]))

    })

});

router.get("/my_info", (request, response) => { // Kullanıcı kendi profilindeki bilgileri görmek istediğinde

    var query = `SELECT email,name,profile_description,avatarUrl,CreateDate FROM users WHERE id = ${userid}`

    db.query(query, function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0) return response.end(`{"error":true,"message":"Bunu yapmayı nasıl başardın bilmiyorum ama bizimle iletişime geç}`)

        return response.end(JSON.stringify(result[0]))

    })

})

router.post("/search_user", (request, response) => { // Başka bir kullanıcıyı ismiyle aramak istediğimizde

    if(!request.body.name || request.body.name.length < 3) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    var query = `SELECT id,name,avatarUrl FROM users WHERE name LIKE CONCAT('%',?,'%') AND NOT id = ${userid} 
    ORDER BY name ASC limit 15`
    db.query(query,[request.body.name], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length == 0) return response.end(`{"error":true,"message":"Aradığınız kişi bulunamadı"}`)

        return response.end(JSON.stringify(result))

    })

})


router.post("/report_user", (request, response) => { // bir kullanıcı başka bir kullanıcıyı şikayet etmek isterse

    if(!request.body.id || !request.body.description) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)

    const date = new Date();
    const finaldate = new Date().toLocaleString('tr-tr')

    var query = `SELECT * FROM user_reports WHERE reported_userid = ? order by timestamp DESC limit 1`
    db.query(query,[request.body.id], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result[0]?.timestamp + 43200000 > Date.now()) return response.end(`{"error":true,"message":"Bu kullanıcıyı zaten şikayet etmişsiniz}`)
        // Eğer kullanıcı 12 saat içinde tekrar şikayet etmek isterse buna izin verme
        var query2 = `INSERT INTO user_reports(reporter_userid,reported_userid,description,timestamp,date) 
        VALUES(${userid},?,?,${Date.now()},"${finaldate}")`
    db.query(query2,[request.body.id,request.body.description], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        return response.end(`{"error":false,"message":"Kullanıcıyı şikayet ettiniz"}`)

    })

    })


});


module.exports = router