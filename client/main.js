const electron = require("electron")
const url = require("url")
const path = require("path")
const {request, response} = require("express");
const {app, BrowserWindow, ipcMain, dialog} = electron
const http = require('http')
var req = require('request');


let mainWindow;

var username = "";

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },

    });
    mainWindow.loadFile(path.join(__dirname, "login/login.html"));


    ipcMain.on("goRegister", (error, data) => {
        mainWindow.loadFile(path.join(__dirname, "register/register.html"));
    })

    ipcMain.on("goLogin", (error, data) => {
        mainWindow.loadFile(path.join(__dirname, "login/login.html"))
    })


    ipcMain.on("register", (err, data) => {
        if (data.password == '' || data.repassword == '' || data.username == '') {
            dialog.showMessageBox(mainWindow, {
                title: "Hata",
                message: "Lutfen tum kutucukları doldurunuz"
            });
            return;
        }
        var propertiesObject = {username: data.username, password: data.password};
        if (data.password == data.repassword) {
            req({url: "http://40.68.42.3:8080/register", qs: propertiesObject}, function (err, response, body) {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        } else {

            dialog.showMessageBox(mainWindow, {
                title: "Hata",
                message: "Şifreler uyuşmuyor!"
            });

        }


    })
    ipcMain.on("login", (err, data) => {
        //  console.log(data);
        var propertiesObject = {username: data.username, password: data.password};
        req({url: "http://40.68.42.3:8080/login", qs: propertiesObject}, function (err, response, body) {
            if (err) {
                console.log(err);

                return;
                if (body.indexOf("hata") != -1) {
                    dialog.showMessageBox(mainWindow, {
                        title: "Hata",
                        message: body
                    })
                }

            } else {
                mainWindow.loadFile(path.join(__dirname, "mainwindow/mainwindow.html"));
                username = data.username;
                mapwindow = new BrowserWindow({
                    webPreferences: {
                        devTools: true,
                        nodeIntegration: true,
                        contextIsolation: false,
                        enableRemoteModule: true
                    },
                });
                mapwindow.openDevTools();
                mapwindow.once("ready-to-show", () => {
                    mapwindow.webContents.send("oldCargos", body);
                    mainWindow.webContents.send("oldCargos", body);
                })
                mapwindow.loadFile(path.join(__dirname, "map/map.html"));


            }


        });
    })
    ipcMain.on("sendCargo", (err, data) => {
        mapwindow.webContents.send("clickCargos", JSON.stringify(data));
        var propertiesObject = {username: username, musteriadi: data.musteriadi, lat: data.lat, lng: data.lng};
        req({url: "http://40.68.42.3:8080/sendCargo", qs: propertiesObject}, function (err, response, body) {
            if (err) {
                console.log(err);
            }
        })

    })
    ipcMain.on("deleteCargo", (err, data) => {
        mapwindow.webContents.send("deleteFromMap", JSON.stringify(data));
        var propertiesObject = {musteriadi: data.musteriadi, lat: data.lat, lng: data.lng};
        req({url: "http://40.68.42.3:8080/deleteCargo", qs: propertiesObject}, function (err, response, body) {
            if (err) {
                console.log(err);
                return;
            }
        })

    })

})


