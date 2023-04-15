const Config = require('./config.json')
let express = require('express');  
let app = express();  
let bodyParser = require('body-parser');
let Wallet = require('ethereumjs-wallet');
const MongoDB = require('./db');

app.use(bodyParser.json());

app.post('/ec/start_poll', (req, res) => {
    const book = req.body;
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
    res.send({msg:'Book is added to the database'});
});

app.post('/register', (req, res) => {
    const mobileNumber = req.body.mobileNumber
    return MongoDB.getInstance().register(req.body.idProof, req.body.addressProof, req.body.type, mobileNumber).then(result=>{
        return res.json({"status":1, message:"Successfully registered."})
    }).catch(err=>{
        return res.json({"status":0, message:err.msg})
    })
})

app.post('/register/sendOTP', (req, res) => {
    return MongoDB.getInstance().sendOTP(req.body.mobileNumber).then(result=>{
        return res.json({"status":1, message:"Successfully sent OTP."})
    }).catch(err=>{
        res.json({"status":0, message: "Unable to send OTP"})
    })
})

app.post('/register/verify', (req, res) => {
    return MongoDB.getInstance().verifyOTP(req.body.mobileNumber, req.body.otp).then(result=>{
        return res.json({"status":1, message:result})
    }).catch(err=>{
        res.json({"status":0, message: "Unable to send OTP"})
    })
})

app.post('/vote/profile', (req, res) => {
    return MongoDB.getInstance().getProfile(req.headers['vaddress']).then(result=>{
        return res.json({"status":1, message:result})
    }).catch(err=>{
        res.json({"status":0, message: "Unable to send OTP"})
    })
})

app.get('/candidates', (req, res) => {
    const book = req.body;
    res.send({msg:'Book is added to the database'});
});

app.post('/candidates/vote', (req, res) => {
    const book = req.body;
    res.send({msg:'Book is added to the database'});
});

MongoDB.getInstance().connect().then(res=>{
    var server = app.listen(8000, function () {  
        var host = server.address().address  
        var port = server.address().port  
        console.log("Example app listening at http://%s:%s", host, port)  
    })  
})
