//const fs = require('fs');
const path = require('path');
const routes = require("./routers/main"); 
//const { Server } = require('socket.io');
const express = require("express");
const bodyParser = require('body-parser');
const ejs = require("ejs");

const app = express();

app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public"))); 

app.use('/', routes);

app.listen(8000, () => {
    console.log("WebServer started on Port 8000");
    //console.log("SocketServer started on Port 3000");
})