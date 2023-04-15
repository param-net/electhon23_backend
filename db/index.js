let Config = require('../config.json');
let {MongoClient} = require('mongodb');
var Wallet = require('ethereumjs-wallet');

class MongoDB{
    constructor(){
        
    }
    static getInstance(){
        if(!MongoDB.instance){
            MongoDB.instance = new MongoDB();
        }
        return MongoDB.instance
    }

    connect(){
        // this.client = new MongoClient(Config.mongodbURL);
        return MongoClient.connect(Config.mongodbURL).then(res=>{
            this.client = res;
            this.database = this.client.db(Config.dbName);
        });
    }

    getVoterInfo(){
        
    }

    register(idProof, addressProof, idType, mobileNumber) {
        const locationArray = ["nippani","athani","Rajaji Nagar"]
        const locationIndex = Math.floor(Math.random() * locationArray.length);
        const location = locationArray[locationIndex]
        if(!idType|| (idType !== "epic" && !idProof) ||!mobileNumber){
            return Promise.reject({"msg":"Invalid id proof"})
        }
        const EthWallet = Wallet.default.generate();
        const address = EthWallet.getAddressString();
        const privateKey = EthWallet.getPrivateKeyString();
        return this.database.collection(`${Config.voterInfo}`).insertOne({ 
            _id: addressProof,
            idProof, 
            idType, 
            address,
            privateKey,
            mobileNumber,
            isVerified: false,
            location: location
        }).then(res=>{
            return this.sendOTP(`${mobileNumber}`);
        }).catch(e=>{
           return Promise.reject({"msg":"User exists"})
        })
    }

    sendOTP(mobileNumber) {
        if(!mobileNumber){
            return Promise.reject({"msg":"Invalid mobile number"})
        }
       return  this.database.collection(`${Config.voterInfo}`).findOne({mobileNumber: mobileNumber}).then(res=>{
           if(!res){
               return Promise.reject({"msg":"User not exists"})
           }
            return this.database.collection(`${Config.otp}`).updateOne({ 
                    _id: mobileNumber
                },
                { $set: { otp: Config.otpString, dateTime: new Date().getTime() } }, 
                { upsert: true })
        }).catch(e=>{
           return Promise.reject({"msg":"User not register"})
        })
    }

    verifyOTP(mobileNumber, otp) {
        if(!mobileNumber|| !otp){
            return Promise.reject({"msg":"Invalid mobile number"})
        }
        return this.database.collection(`${Config.otp}`).findOne({ 
            _id: mobileNumber,
            otp:otp,
        }).then(res=>{
            if(!res){
                throw new Error("Invalid otp")
            }
            return this.database.collection(`${Config.voterInfo}`).updateOne({ 
                mobileNumber: mobileNumber,
            },
            { $set: { isVerified: true } })
        }).then(res=>{
            return this.database.collection(`${Config.voterInfo}`).findOne({mobileNumber:mobileNumber})
        }).catch(e=>{
           return Promise.reject({"msg":"Invalid phone number/otp"})
        })
    }

    getProfile(address) {
        if(!address){
            return Promise.reject({"msg":"Auth failed"})
        }
        return this.database.collection(`${Config.voterInfo}`).findOne({ 
            address: address,
        }).then(res=>{
            if(!res){
                return Promise.reject({msg:"Unable to locate user"})
            }
            return res
        }).catch(e=>{
           return Promise.reject({"msg":"Unable to locate user"})
        })
    }

    addCandidate(json) {
        if(!json){
            return Promise.reject({"msg":"Auth failed"})
        }
        return this.database.collection(`${Config.candidate}`).insertOne(json).then(res=>{
            if(!res) {
                return Promise.reject({msg:"Unable to add candidate"})
            }
            return res
        }).catch(e=>{
           return Promise.reject({"msg":"Unable to add candidate"})
        })
    }

    getCandidates(location) {
        if(!location){
            return Promise.reject({"msg":"Invalid location"})
        }
        return this.database.collection(`${Config.candidate}`).find({ 
            location: location,
        }).toArray().then(res=>{
            return res
        }).catch(e=>{
           return Promise.reject({"msg":"Unable to locate user"})
        })
    }

    getVoters(location){
        return this.database.collection(`${Config.voterInfo}`).find({ 
            location: location,
        }).toArray().then(res=>{
            return res
        }).catch(e=>{
           return Promise.reject({"msg":"Unable to locate user"})
        })
    }
    castVote(vAddress, cID) {
        return this.database.collection(`${Config.voterInfo}`).findOne({ 
            address: vAddress,
        }).then(res=>{
            if(!res){
                return new Error({msg:"Unable to locate user"})
            }
            if(res.isVoted){
                throw new Error({msg:"Already voted"})
            }
            return this.database.collection(`${Config.voterInfo}`).updateOne({ 
                address: vAddress 
            },
            { $set: { isVoted: true } }, 
            { upsert: true })
        })
    }
}
module.exports = MongoDB;