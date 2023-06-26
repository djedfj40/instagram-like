const express = require('express')
const app = express()
const db = require('./api/v1/database/database');
const router = express.Router();
var bodyParser = require('body-parser')
require("dotenv").config({path:"./.env"}) // .env dosyasındaki secret jwt key için.
const bodyParserErrorHandler = require('express-body-parser-error-handler')
const fileUpload = require('express-fileupload'); // Kullanıcının dosya yüklemesi için

app.use(fileUpload({limits: {fileSize: 10000000,},abortOnLimit: true,})); // Kullanıcı en fazla 10mb boyutunda dosya yükleyebilir

app.use(bodyParser.json())
app.use(bodyParserErrorHandler()); // kullanıcının gönderdiği json formatı hatalıysa, daha mantıklı hata mesajları gösterir

var apiversion = "v1" // hangi api versiyonunu kullanmak istiyoruz

// router isim tanımlamaları
const version = require(`./api/${apiversion}/routers/version_control/version_check.js`);
const users = require(`./api/${apiversion}/routers/user/user.js`);
const authentication = require(`./api/${apiversion}/middlewares/authentication.js`);
const user_profile = require(`./api/${apiversion}/routers/user/user_profile.js`);
const posts = require(`./api/${apiversion}/routers/posts/posts.js`);
const stories = require(`./api/${apiversion}/routers/story/story.js`);
const private_message = require(`./api/${apiversion}/routers/dm/dm.js`);
const logger = require(`./api/${apiversion}/middlewares/logger.js`);
//

app.use(express.static('public')) // public klasörünü herkesin erişmesi için açıyoruz.
// Örneğin kullanıcılar www.api.com:3000/uploads/images/resim.png yolunu kullanarak public klasörü içindeki nesnelere erişebilirler.

// routers
app.use(logger) // Bütün yapılan istekleri kaydeder
app.use(`/${apiversion}/users`,users)
app.use(`/${apiversion}/version`,version)
app.use(authentication)
app.use(`/${apiversion}/users`,user_profile)
app.use(`/${apiversion}/posts`,posts)
app.use(`/${apiversion}/story`,stories)
app.use(`/${apiversion}/dm`,private_message)
//


app.get('/', (request, response) => {
  return response.end('Merhaba')
})

const port = 3000
app.listen(port, () => {

  console.log(`Server ${port} portunda başlatıldı`)
})