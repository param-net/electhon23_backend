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
        const location = ["vijayawada","domlur","indiranar"]
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
            location: location[1]
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

    getCandidates(location) {
        if(!location){
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
    
    castVote(){

    }
}
module.exports = MongoDB;