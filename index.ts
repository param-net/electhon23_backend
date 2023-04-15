const Config = require('./config.json')
var express = require('express');  
var app = express();  
var bodyParser = require('body-parser');  
app.use(bodyParser.json());

app.post('/ec/start_poll', (req, res) => {
    const book = req.body;
    // Output the book to the console for debugging
    console.log(book);
    res.send({msg:'Book is added to the database'});
});

app.get('/ec/end_poll', (req, res) => {
    const book = req.body;
    // Output the book to the console for debugging
    console.log(book);
    res.send({msg:'Book is added to the database'});
});

app.get('/results', (req, res) => {
    const book = req.body;
    // Output the book to the console for debugging
    console.log(book);
    res.send({msg:'Book is added to the database'});
});

app.post('/register/', (req, res) => {
    
})

app.post('/register/otp', (req, res) => {

})
app.get('/candidates/', (req, res) => {
    const book = req.body;
    // Output the book to the console for debugging
    console.log(book);
    res.send({msg:'Book is added to the database'});
});
app.post('/candidates/vote', (req, res) => {
    const book = req.body;
    // Output the book to the console for debugging
    console.log(book);
    res.send({msg:'Book is added to the database'});
});

var server = app.listen(8000, function () {  
    var host = server.address().address  
    var port = server.address().port  
    console.log("Example app listening at http://%s:%s", host, port)  
})  