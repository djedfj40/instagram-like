const mysql = require('mysql');
 
const connection = mysql.createPool({
  host: 'localhost',
  user: 'instagram',
  password: 'dugmyn-sonzok-nappA6',
  database: 'instagram',
  connectionLimit : 15,
  idleTimeout: 30000, // 30 saniye
  maxIdleConnections: 5,
  multipleStatements: true
});
 
connection.query('SELECT 1 + 1 AS solution',(err) => {
    if(err) throw err
    else{
    console.log('Veritabanı sunucusuna başarıyla bağlanıldı');
    }
});

module.exports = connection;