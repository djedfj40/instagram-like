const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const db = require("../../database/database.js")
const id_grab = require("../../middlewares/user_id_grab.js")
var emailValidator = require('validator'); // e-mail geçerli mi diye kontrol eden eklenti
var hashing = require('crypto') // hashing algoritması için (sha256 kullanıldı)



router.post("/register", (request, response) => { // kullanıcı kaydı

    if(request.body.email === undefined || request.body.password === undefined || request.body.name?.length <4 || request.body.name === undefined || request.body.sex > 1 || request.body.sex < 0){
        return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)
    }

    if(request.body.password.length < 8) return response.end(`{"error":true,"message":"Şifreniz 8 karakterden küçük olamaz"}`)
    if(!emailValidator.isEmail(request.body.email)) return response.end(`{"error":true,"message":"Lütfen geçerli bir e-posta girin"}`)

    var imagePath = ""
    if(request.body.sex == 1) imagePath = "/uploads/images/user_avatars/male.jpg" // kullanıcının girdiği cinsiyete göre default avatar fotoğrafı belirliyoruz
    else imagePath = "/uploads/images/user_avatars/female.jpg"

    var query = 'SELECT email FROM users WHERE email = ? LIMIT 1' // e-posta kayıtlı mı diye kontrol et
    db.query(query, [request.body.email], function (err, result) {
        
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length != 0) return response.end(`{"error":true,"message":"Bu e-posta adresi zaten kayıtlı"}`)

        const date = new Date();
        const finaldate = new Date().toLocaleString('tr-tr')
        var password = hashing.createHash('sha256').update(request.body.password).digest('hex') // hashing

        var query2 = `INSERT INTO users (email,password,name,sex,profile_description,IsActive,avatarUrl,userType,RegisteredWith,CreateDate) 
        VALUES (?,?,?,?,"Merhaba",true,"${imagePath}","normal","Email","${finaldate}")`
        db.query(query2, [request.body.email,password,request.body.name,request.body.sex], function (err, result) {
            
            if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

            return response.end(`{"error":false,"message":"Hesabınız başarıyla oluşturuldu"}`)

        });

    });

});

router.post("/login", (request, response) => { // kullanıcı girişi

    if(request.body.email === undefined || request.body.password === undefined) return response.end(`{"error":true,"message":"Bilgiler eksik"}`)

    var password = hashing.createHash('sha256').update(request.body.password).digest('hex') // kullanıcının girdiği şifreyi sha256 yap

    var query = 'SELECT id FROM users WHERE email = ? AND password = ? AND IsActive = 1 LIMIT 1';
    db.query(query, [request.body.email,password], function (err, result) {
        
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length === 0) return response.end(`{"error":true,"message":"Kullanici adı veya şifre yanlış"}`)

        let sign_data = {"id":result[0].id} // kullanıcının id değerini de secret keyde tutuyoruz
        const token = jwt.sign(sign_data, process.env.SECRETKEY); // .env dosyasındaki SECRET_KEY ile tokenimizi oluşturuyoruz
       
        return response.end(`{"error":false,"message":"Başarıyla giriş yaptınız" "token":"${token}"}`)

      });


});



router.post("/change_password", (request, response) => { // kullanıcı şifresini değiştirmek isterse

    if(request.body.newpassword === undefined) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)
    if(request.body.newpassword.length <8) return response.end(`{"error":true,"message":"En az 8 haneli şifre giriniz"}`)

    var userid = id_grab.getid(request.header("Authorization")) // jwt deki userın idsini çekiyoruz
    if(userid === "error" || userid === undefined) return response.end(`{"error":true,"message":"Lütfen tekrar giriş yapın"}`) // jwt geçerli değilse

    var new_password = hashing.createHash('sha256').update(request.body.newpassword).digest('hex')

    var query = `UPDATE users SET password = ? WHERE id=${userid}`
    db.query(query, [new_password], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        return response.end(`{"error":false,"message":"Şifreniz başarıyla değiştirildi}`)

    })


});

router.post("/password_reset", (request, response) => { // şifre sıfırlama isteği oluştur

    if(!request.body.email || !request.body.newpassword) return response.end(`{"error":true,"message":"Eksik bilgi girdiniz"}`)
    if(request.body.newpassword.length < 8) return response.end(`{"error":true,"message":"Yeni şifreniz en az 8 haneli olmalıdır"}`)

    var query = `SELECT id FROM users WHERE email = ?`
    db.query(query, [request.body.email], function (err, result) {
        if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

        if(result.length === 0) return response.end(`{"error":true,"message":"Böyle bir kullanıcı bulunamadı"}`)

        var new_password = hashing.createHash('sha256').update(request.body.newpassword).digest('hex')

        const date = new Date();
        const finaldate = new Date().toLocaleString('tr-tr')
        
        var query2 = `INSERT INTO password_reset(userid,newpassword,token,createDate) 
        VALUES(${result[0].id},"${new_password}","${hashing.randomBytes(16).toString('hex')}","${finaldate}")`
        db.query(query2, function (err, result) {
            if (err) return response.end(`{"error":true,"message":"Veritabanında bir hata oluştu"}`)

            return response.end(`{"error":false,"message":"Şifre sıfırlama isteği başarıyla oluşturuldu. Epostanızı kontrol edin"}`)

        })

    })

});


router.get("/password_reset2", (request, response) => { // kullanıcı linke tıkladığında şifresini değiştir

    if(!request.query.token) return response.end(`Eksik bilgi girdiniz`)

    var query = `SELECT * FROM password_reset WHERE token = ? AND isActive = true limit 1`
    db.query(query, [request.query.token], function (err, result) {
        if (err) return response.end(`Veritabanında bir hata oluştu`)

        if(result.length === 0) return response.end(`<script>alert("Gecersiz istek")</script>`)

        var query2 = `UPDATE users SET password = "${result[0].newpassword}" 
        WHERE id = ${result[0].userid}; UPDATE password_reset SET isActive = 0 WHERE token = ? limit 1`
        db.query(query2, [request.query.token], function (err, result) {
            if (err) return response.end(`Veritabanında bir hata oluştu`)

           return response.end(`<script>alert("Sifreniz basariyla degistirildi")</script>`) // bu endpointdeki responseları JSON olarak göndermiyorum çünkü kullanıcı büyük ihtimalle bu işlemi tarayıcıdan yapıcak
        })


    })

});



module.exports = router