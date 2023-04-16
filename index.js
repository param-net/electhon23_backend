const Config = require('./config.json')
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let Wallet = require('ethereumjs-wallet');
const MongoDB = require('./db');
const cors = require('cors');
const ParamNetwork = require('../web3/index');
let paramNetwork = new ParamNetwork({ url: Config.geth });

app.use(bodyParser.json());
app.use(cors())

app.post('/ec/start_poll', (req, res) => {
    const book = req.body;
    let electhon = paramNetwork.getElecthonBookManager();
    electhon.enableAbsolute({
        from: Config.keystore.address,
        privateKey: Config.keystore.privateKey
    })
    res.send({ msg: 'Book is added to the database' });
});

app.get('/ec/end_poll', (req, res) => {
    const book = req.body;
    console.log(book);
    let electhon = paramNetwork.getElecthonBookManager();
    electhon.disableAbsolute({
        from: Config.keystore.address,
        privateKey: Config.keystore.privateKey
    })
    res.send({ msg: 'Book is added to the database' });
});

app.get('/results', (req, res) => {
    res.send({ msg: 'Pending' });
});

app.get('/vote/schudle', (req, res) => {
    const mobileNumber = req.body.mobileNumber
    res.send({ msg: 'Pending' });
});

app.post('/register', (req, res) => {
    const mobileNumber = req.body.mobileNumber
    return MongoDB.getInstance().register(req.body.idProof, req.body.addressProof, req.body.type, mobileNumber).then(result => {
        return res.json({ "status": 1, message: "Successfully registered." })
    }).catch(err => {
        return res.json({ "status": 0, message: err.msg })
    })
})

app.post('/register/sendOTP', (req, res) => {
    return MongoDB.getInstance().sendOTP(req.body.mobileNumber).then(result => {
        return res.json({ "status": 1, message: "Successfully sent OTP." })
    }).catch(err => {
        res.json({ "status": 0, message: "Unable to send OTP" })
    })
})

app.post('/register/verify', (req, res) => {
    return MongoDB.getInstance().verifyOTP(req.body.mobileNumber, req.body.otp).then(result => {
        return res.json({ "status": 1, message: result })
    }).catch(err => {
        res.json({ "status": 0, message: "Unable to send OTP" })
    })
})

app.post('/vote/profile', (req, res) => {
    return MongoDB.getInstance().getProfile(req.headers['vaddress']).then(result => {
        return res.json({ "status": 1, message: result })
    }).catch(err => {
        res.json({ "status": 0, message: "Unable to send OTP" })
    })
})

app.post('/candidate/add', (req, res) => {
    return MongoDB.getInstance().addCandidate(req.body).then(result => {
        return res.json({ "status": 1, message: result })
    }).catch(err => {
        res.json({ "status": 0, message: "Unable to send OTP" })
    })
});

app.post('/candidates', (req, res) => {
    return MongoDB.getInstance().getCandidates(req.body.location).then(result => {
        return res.json({ "status": 1, message: result })
    }).catch(err => {
        res.json({ "status": 0, message: "Unable to get candidates" })
    })
});

app.post('/voter/list', (req, res) => {
    return MongoDB.getInstance().getVoters(req.body.location).then(result => {
        return res.json({ "status": 1, message: result })
    }).catch(err => {
        res.json({ "status": 0, message: "Unable to get candidates" })
    })
});

app.post('/voter/vote', (req, res) => {
    const address = req.body.address;
    const vote = req.body.cID;
    return MongoDB.getInstance().castVote(address, vote).then(result => {
        return res.json({ "status": 1, message: result })
    }).catch(e => {
        res.json({ "status": 0, message: !e.msg ? "Unable to cast your vote" : e.msg })
    })
});

MongoDB.getInstance().connect().then(res => {
    var server = app.listen(8000, function () {
        var host = server.address().address
        var port = server.address().port
        console.log("Example app listening at http://%s:%s", host, port)
    })
})
