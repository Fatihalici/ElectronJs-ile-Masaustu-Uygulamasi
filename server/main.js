var mysql = require('mysql');
const express = require('express');
const {hashPassword} = require("mysql/lib/protocol/Auth");
const app = express();
const port = process.env.PORT || 8080;

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    pass: "",
    database: "yazlab1"
});
app.get('/login', function (req, res) {
    con.connect(function (err) {
        var sorgu = "SELECT * FROM kullanicilar WHERE name = '" + req.query.username + "' AND password = '" + req.query.password + "'";

        con.query(sorgu, function (err, sonuc) {
            if (sonuc.length === 0) {
                console.log("Kullanıcı adı veya sifre hatalıdır. Lutfen dogru bilgileri giriniz. ");
                return res.send("Kullanıcı adı veya sifre hatalıdır. Lutfen dogru bilgileri giriniz.");
            } else {
                console.log("Girilen bilgiler doğrudur. Giris yapılıyor...");
                con.query("SELECT musteriadi,lat,lng FROM kargolar WHERE UserID = '" + sonuc[0].UserID + "'", function (err, result) {
                    res.send(result);

                });


            }

        })

    })


});
app.get('/register', function (req, res) {
    con.connect(function (err) {
        con.query("SELECT * FROM kullanicilar WHERE name = '" + req.query.username + "'", function (err, result) {
            if (err) return;
            else {
                var sorgu = "INSERT INTO kullanicilar (name,password) VALUES ('" + req.query.username + "','" + req.query.password + "')";
                if (sorgu) {
                    con.query(sorgu, function (err) {
                        if (err) {
                            console.log("Bu adla hesap zaten var");
                            return;
                        }
                        console.log("Hesap olusturuldu");
                    })

                }
            }
        })
        console.log("İstek geldi");
    });
});

app.get('/sendCargo', function (req, res) {
    let sorgu = "INSERT INTO kargolar (UserID,musteriadi,lat,lng) VALUES ((SELECT UserID FROM kullanicilar WHERE name='" + req.query.username + "'),'" + req.query.musteriadi + "','" + req.query.lat + "','" + req.query.lng + "')";


    con.query(sorgu, function (err, result) {

        if (err) {
            console.log(err)
        } else {
            console.log("kargo olusturuldu");


        }
    });
})
app.get('/deleteCargo', function (req, res) {
    let sorgu = "DELETE FROM kargolar WHERE musteriadi='" + req.query.musteriadi + "'AND lat = '" + req.query.lat + "'AND lng = '" + req.query.lng + "'";


    con.query(sorgu, function (err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log("kargo silindi");
        }
    });
})


var server = app.listen(8080, function (err) {
    if (err) throw err;
    console.log("Sunucu baslatildi");
});


con.connect(function (err) {
    if (err) throw err;
    var sorgu = "CREATE TABLE kullanicilar (UserID INT AUTO_INCREMENT PRIMARY KEY ,name VARCHAR(30) UNIQUE KEY ,password VARCHAR(20))";
    con.query(sorgu, function (err) {
        if (err) return;
        console.log("Tablo olusturuldu");
    })

});
con.connect(function (err) {
    var sorgu = "CREATE TABLE kargolar (KargoID INT AUTO_INCREMENT PRIMARY KEY, UserID INT, musteriadi VARCHAR(30), lat DOUBLE, lng DOUBLE)";
    con.query(sorgu, function (err) {
        if (err) return;
        console.log("Tablo2 olusturuldu");
    })
})


