let Config = require('../config.json');
let { MongoClient } = require('mongodb');
let randomName = require('random-indian-name')
var Wallet = require('ethereumjs-wallet');
const ParamNetwork = require('../web3/index');
let paramNetwork = new ParamNetwork({ url: Config.geth });

class MongoDB {

    constructor() {

    }

    static getInstance() {
        if (!MongoDB.instance) {
            MongoDB.instance = new MongoDB();
        }
        return MongoDB.instance
    }

    connect() {
        // this.client = new MongoClient(Config.mongodbURL);
        return MongoClient.connect(Config.mongodbURL).then(res => {
            this.client = res;
            this.database = this.client.db(Config.dbName);
        });
    }

    getVoterInfo() {

    }

    register(idProof, addressProof, idType) {
        const locationArray = ["Nippani", "Athani", "Rajaji Nagar"]
        const pAddress = [
            [", ASHOK NAGAR, NIPPANI, BELGUAM, KARNATKA-591237", ", Sawant Colony, Nipani, Karnataka-591237", ", Akkol Road, Nipani, Karnataka-591237"],
            [", BASAVESHWARA CIRCLE, Athani, Karnataka-591304", ", SH 12, Athani, Karnataka-591304", ", Haliyal Circle, near Jayanthi Sagar Hotel, Athani, Karnataka-591304"],
            [", Opp. Dhobighat, near OG Varier Bakery, 3rd Block, Rajajinagar, Bengaluru, Karnataka-560010", ", WOC, 5th Block, Rajajinagar, Bengaluru, Karnataka-560010", ", 18th main, 5th Block, Jedara Halli, Rajajinagar, Bengaluru, Karnataka 560010"],
        ]
        const locationIndex = Math.floor(Math.random() * locationArray.length);
        const locationAddressIndex = Math.floor(Math.random() * pAddress[locationIndex].length);
        const locationAddress = "Door no:" + Math.floor((Math.random() * 50)) + pAddress[locationIndex][locationAddressIndex]
        const location = locationArray[locationIndex]
        const firstName = randomName({ first: true });
        const lastName = randomName({ last: true }); // -> "Seth"
        if (!idType || (idType !== "epic" && !idProof)) {
            return Promise.reject({ "msg": "Invalid id proof" })
        }
        let mobileNumber = addressProof;//addressProof
        let epicNumber = mobileNumber;
        if (idType == "epic") {
            mobileNumber = mobileNumber.substring(3)
            mobileNumber = mobileNumber + mobileNumber.substring(0, 3)
        } else {
            mobileNumber = mobileNumber.substring(2)
            epicNumber = "WKJ" + this.randomENumber()
        }
        const EthWallet = Wallet.default.generate();
        const address = EthWallet.getAddressString();
        const privateKey = EthWallet.getPrivateKeyString();
        const name = firstName + " " + lastName;
        const soName = randomName({ gender: "male", first: true }) + " " + lastName
        // const pAddress = 
        return this.database.collection(`${Config.voterInfo}`).insertOne({
            _id: addressProof,
            name,
            soName,
            pAddress: locationAddress,
            idProof,
            idType,
            address,
            isAdmin: false,
            privateKey,
            mobileNumber,
            isVerified: 0,
            location: location,
            epicNumber: epicNumber
        }).then(() => {
            let metaInfo = {
                name,
                soName,
                pAddress: locationAddress,
                addressProof,
                mobileNumber,
                isVerified: false,
                location
            }
            let electhon = paramNetwork.getElecthonBookManager();
            return electhon.addUser(JSON.stringify(metaInfo), addressProof, idType, {
                "from": address,
                "privateKey": privateKey.substring(2)
            })
        }).then(hash => {
            console.log('User Register Successfully. For more detail->', hash);
            return this.sendOTP(`${mobileNumber}`);
        }).catch(e => {
            return Promise.reject({ "msg": "User exists" })
        })
    }
    randomENumber() {
        var minm = 1000000;
        var maxm = 9999999;
        return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
    }

    sendOTP(mobileNumber) {
        if (!mobileNumber) {
            return Promise.reject({ "msg": "Invalid mobile number" })
        }
        return this.database.collection(`${Config.voterInfo}`).findOne({ $or: [{ mobileNumber: mobileNumber }, { _id: mobileNumber }] }).then(res => {
            if (!res) {
                return Promise.reject({ "msg": "User not exists" })
            }
            return this.database.collection(`${Config.otp}`).updateOne({
                _id: mobileNumber
            },
                { $set: { otp: Config.otpString, dateTime: new Date().getTime() } },
                { upsert: true })
        }).catch(e => {
            return Promise.reject({ "msg": "User not register" })
        })
    }

    verifyOTP(mobileNumber, otp) {
        if (!mobileNumber || !otp) {
            return Promise.reject({ "msg": "Invalid mobile number" })
        }
        return this.database.collection(`${Config.otp}`).findOne({
            _id: mobileNumber,
            otp: otp,
        }).then(res => {
            if (!res) {
                throw new Error("Invalid otp")
            }
            return this.database.collection(`${Config.voterInfo}`).updateOne({
                $or: [{ mobileNumber: mobileNumber }, { _id: mobileNumber }],
                idType: { $ne: "form6" }
            },
                { $set: { isVerified: 1 } })
        }).then(res => {
            return this.database.collection(`${Config.voterInfo}`).findOne({ $or: [{ mobileNumber: mobileNumber }, { _id: mobileNumber }] })
        }).catch(e => {
            return Promise.reject({ "msg": "Invalid phone number/otp" })
        })
    }

    getProfile(address) {
        if (!address) {
            return Promise.reject({ "msg": "Auth failed" })
        }
        return this.database.collection(`${Config.voterInfo}`).findOne({
            address: address,
        }).then(res => {
            if (!res) {
                return Promise.reject({ msg: "Unable to locate user" })
            }
            return res
        }).catch(e => {
            return Promise.reject({ "msg": "Unable to locate user" })
        })
    }

    addCandidate(json) {
        if (!json) {
            return Promise.reject({ "msg": "Auth failed" })
        }
        return this.database.collection(`${Config.candidate}`).insertOne(json).then(res => {
            if (!res) {
                return Promise.reject({ msg: "Unable to add candidate" })
            }
            return res
        }).catch(e => {
            return Promise.reject({ "msg": "Unable to add candidate" })
        })
    }

    getCandidates(location) {
        if (!location) {
            return Promise.reject({ "msg": "Invalid location" })
        }
        return this.database.collection(`${Config.candidate}`).find({
            location: location,
        }).toArray().then(res => {
            return res
        }).catch(e => {
            return Promise.reject({ "msg": "Unable to locate user" })
        })
    }

    getVoters(location) {
        return this.database.collection(`${Config.voterInfo}`).find({
            location: location,
            isAdmin: false,
            isVerified: 1
        }).toArray().then(res => {
            return res
        }).catch(e => {
            return Promise.reject({ "msg": "Unable to locate user" })
        })
    }

    castVote(vAddress, cID) {
        const voteType = cID ? "Online" : "Offline";
        return this.database.collection(`${Config.voterInfo}`).findOne({
            address: vAddress,
        }).then(res => {
            if (!res) {
                return Promise.reject({ msg: "Unable to locate user" })
            }
            if (res.isVoted) {
                return Promise.reject({ msg: "Already voted" })
            }
            let options = {
                "from": res.address,
                "privateKey": res.privateKey.substring(2)
            }
            if (voteType == "Offline") {
                options = {
                    "from": Config.keystore.address,
                    "privateKey": Config.keystore.privateKey
                }
            }
            let electhon = paramNetwork.getElecthonBookManager();
            let smartContract = electhon.giveVoting(res.address, voteType, options)

            let updateRecord = this.database.collection(`${Config.voterInfo}`).updateOne({
                address: vAddress,
            }, { $set: { isVoted: true, cID: cID, "voteType": voteType } }, { upsert: true })

            return Promise.all([smartContract, updateRecord])
        }).then(data => {
            if (data && data.length == 2) {
                console.log("User Voted Successfully. For more details->", data[0])
            }
            return "Voted Successfully"
        })
    }

    formData(json) {
        let jsondData = JSON.stringify(json)
        if (!json) {
            return Promise.reject({ "msg": "Auth failed" })
        }
        const EthWallet = Wallet.default.generate();
        const address = EthWallet.getAddressString();
        const privateKey = EthWallet.getPrivateKeyString();
        json.address = address
        json.privateKey = privateKey
        json.isVerified = 2
        json.idType = "form6"
        json.isAdmin = false

        return this.database.collection(`${Config.voterInfo}`).insertOne(json).then(res => {
            if (!res) {
                return Promise.reject({ msg: "Unable to add form data" })
            }
            let electhon = paramNetwork.getElecthonBookManager();
            return electhon.addUser(jsondData, json._id, json.idType, {
                "from": address,
                "privateKey": privateKey.substring(2)
            })
        }).then(res => {
            return this.sendOTP(json._id)
        }).then(d => {
            console.log(d)
        }).catch(e => {
            return Promise.reject({ "msg": "Unable to add form data" })
        })
    }

    getFormData(status, location) {
        status = parseInt(status)
        return this.database.collection(`${Config.voterInfo}`).find({
            isVerified: status, idType: "form6", location: location
        }).toArray().then(res => {
            if (!res) {
                return Promise.reject({ msg: "Unable to get the data" })
            }
            return res
        }).catch(e => {
            return Promise.reject({ "msg": "Unable to get data" })
        })
    }

    updateFormStatus(_id, status) {
        status = parseInt(status)
        let updateQuery = { isVerified: status }
        if (status == 1) {
            updateQuery.epicNumber = "WKJ" + this.randomENumber()
        }

        return this.database.collection(`${Config.voterInfo}`).updateOne({
            _id: _id, idType: "form6"
        }, { $set: updateQuery }, { upsert: true }).then(res => {
            if (!res) {
                return Promise.reject({ msg: "Unable to update the status" })
            }
            return res
        }).catch(e => {
            return Promise.reject({ "msg": "Unable to update the status" })
        })
    }
}
module.exports = MongoDB;