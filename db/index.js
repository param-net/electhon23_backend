let Config = require('../config.json');
let { MongoClient } = require('mongodb');
let randomName = require('random-indian-name')
var Wallet = require('ethereumjs-wallet');
const ParamNetwork = require('../web3/index');
let paramNetwork = new ParamNetwork({ url: "ws://34.224.243.54:8546/" });

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
        if (idType == "epic") {
            mobileNumber = mobileNumber.substring(3)
            mobileNumber = mobileNumber + mobileNumber.substring(0, 3)
        } else {
            mobileNumber = mobileNumber.substring(2)
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
            privateKey,
            mobileNumber,
            isVerified: false,
            location: location
        }).then(res => {
            let metaInfo = {
                addressProof,
                mobileNumber,
                isVerified: false,
                location
            }
            let electhon = paramNetwork.getElecthonBookManager();
            return electhon.addUser(JSON.stringify(metaInfo), idProof, idType, {
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

    sendOTP(mobileNumber) {
        if (!mobileNumber) {
            return Promise.reject({ "msg": "Invalid mobile number" })
        }
        return this.database.collection(`${Config.voterInfo}`).findOne({ mobileNumber: mobileNumber }).then(res => {
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
                mobileNumber: mobileNumber,
            },
                { $set: { isVerified: true } })
        }).then(res => {
            return this.database.collection(`${Config.voterInfo}`).findOne({ mobileNumber: mobileNumber })
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
            return this.database.collection(`${Config.voterInfo}`).updateOne({
                address: vAddress,
            },
                { $set: { isVoted: true, cID: cID, "voteType": voteType } },
                { upsert: true })
        })
    }
}
module.exports = MongoDB;