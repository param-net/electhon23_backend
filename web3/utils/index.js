const Tx = require('ethereumjs-tx');
/**
 * 
 * ParamUtils will have multiple methods which will be helpful when you converting one value to another values.
 * 
 * @author Param Team
 */
const _paramConfig = require('../config.json');
// const _paramConfig = require('quorum-js');
class ParamUtils {

    static submitTransaction(connection, txData, options) {
        return new Promise((resolve, reject) => {
            connection.eth.getTransactionCount(options.from, function (error, nonce) {
                if (error) {
                    reject(error)
                }
                return resolve(nonce);
            });
        }).then((nonce) => {
            // options.nonce = options.nonces;
            options.nonce = nonce;
            const ParamPrivateNode = require('../privatenode');
            if (!options.isPrivate) {
                // return ParamUtils.sendPublicRawTx(connection, txData, options);
                options.privateFrom = ParamUtils.getPrivateFrom(connection)
                options.privateFor = ParamUtils.getPrivateFor(connection)
                options.isPrivate = true;
            }
            options.data = txData;
            let currentProvider = connection.currentProvider;
            let pubUrl = currentProvider.connection ? currentProvider.connection.url.slice(0, currentProvider.connection.url.length - 1) : currentProvider.host;
            connection = { privateUrl: ParamUtils.getPrivateURL(pubUrl), publicUrl: pubUrl, web3: connection };
            return (ParamPrivateNode.sendRawTransaction(options, connection));
        });
    }

    static sendPublicRawTx(connection, txData, options) {
        return new Promise((resolve, reject) => {
            if (txData && !txData.toLowerCase().startsWith('0x')) {
                txData = '0x' + txData;
            }
            if (!options.from) {
                reject("Invalid from address");
            }
            options.from = options.from.toLocaleLowerCase()
            if (!options.from.startsWith("0x")) {
                options.from = "0x" + options.from;
            }
            let transactionObj = {
                nonce: options.nonce,
                from: options.from,
                data: txData,
                gasPrice: 0,
                to: options.to,
            }
            connection.eth.estimateGas(transactionObj, function (error, gas) {
                if (error) {
                    reject(error);
                    return;
                }
                gas = parseInt(gas * 1.3);
                transactionObj.gas = gas;
                const privateKey = Buffer.from(options.privateKey, 'hex');
                const tx = new Tx(transactionObj);
                tx.sign(privateKey);
                const serializedTx = tx.serialize();
                connection.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (error, data) {
                    if (error) {
                        reject(error);
                        return
                    }
                    resolve(data)
                })
            })
        })
    }
    static getPrivateURL(pubUrl) {
        for (let key in _paramConfig.privateNodes) {
            if (_paramConfig.privateNodes[key].rpcURL === pubUrl) {
                return _paramConfig.privateNodes[key].privateUrl;
            }
        }
        return undefined;
    }
    static getPrivateFor(connection, privateFor) {
        if (privateFor && privateFor.length > 0) {
            return privateFor;
        }
        const hostURL = connection.currentProvider.host;
        privateFor = [];
        for (let key in _paramConfig.privateNodes) {
            if (_paramConfig.privateNodes[key].name == "Custom")
                continue
            if (_paramConfig.privateNodes[key].rpcURL != hostURL) {
                privateFor = privateFor.concat(_paramConfig.privateNodes[key].publicAddress);
            }
        }
        if (privateFor.length == 0) {
            throw new Error("Please check your config.")
        }
        return privateFor;
    }

    static getPrivateFrom(connection) {
        const hostURL = connection.currentProvider.host;
        for (let key in _paramConfig.privateNodes) {
            if (_paramConfig.privateNodes[key].rpcURL === hostURL) {
                return _paramConfig.privateNodes[key].publicAddress[0];
            }
        }
        return undefined
        // return "4o+Lc9hcalJFAW/5dD3lH4cWDSIKG5keQQGmvVIGeRc=";
    }

    /**
     * encryptProtectedMessage will be used for encrypt message with the help of receiver public key using PGP algoritham and its returns encrypted string.
     * 
     * @param {String} str Receivers public key
     * @returns {String} openpgp.encrypt object. 
     */
    static getBase64ToHex(str) {
        return Buffer.from(str, "base64").toString("hex");
    }

    /**
     * encryptProtectedMessage will be used for encrypt message with the help of receiver public key using PGP algoritham and its returns encrypted string.
     * 
     * @param {String} str Receivers public key
     * @returns {String} openpgp.encrypt object. 
     */
    static getHexToBase64(str) {
        return Buffer.from(str, "hex").toString("base64");
    }

    /**
     * encryptProtectedMessage will be used for encrypt message with the help of receiver public key using PGP algoritham and its returns encrypted string.
     * 
     * @param {String} publicKey Receivers public key
     * @param {String} text Plain text to be encrypted.
     * @returns {String} openpgp.encrypt object. 
     */
    // static encryptProtectedMessage(publicKey, text){
    //     const pubkey = publicKey;
    //     return new Promise((resolve, reject)=>{
    //     openpgp.key.readArmored(pubkey).then(result=>{       // parse armored message
    //         const options = {
    //             message: openpgp.message.fromText(text),        // input as Message object
    //             publicKeys: result.keys                         // for encryption
    //         };
    //         return openpgp.encrypt(options);
    //         }).then(cipher=>{
    //             return resolve(cipher);
    //         }).catch(e=>{
    //             reject(e);
    //         })
    //     })
    // }

    /**
     * decryptProtectedMessage will be used for decrypt message with the help of receiver's private key using PGP algoritham and its returns decrypted string.
     * 
     * @param {String} encryptedText encrypted text want's convert to plain text
     * @param {String} privateKey private key / Armored 
     * @param {String} passphrase Password to unlock Armored key pass null if your using ECDSA private key.
     * @param {String} pubkey Armored public key
     * @returns {String} plain text
     */
    // static decryptProtectedMessage(encryptedText, privateKey, passPhrase, pubkey){
    //     return new Promise((resolve,reject)=>{
    //             openpgp.key.readArmored(privateKey).then(result=>{
    //             const privKeyObj=result.keys[0];
    //             privKeyObj.decrypt(passPhrase);         //decrypt the private key with the passphrase
    //             return privKeyObj;
    //         }).then(async (privKeyObj)=>{
    //             const options = {
    //                 message: await openpgp.message.readArmored(encryptedText),    // parse armored message
    //                 publicKeys: pubkey?(await openpgp.key.readArmored(pubkey)).keys:null,
    //                 privateKeys: [privKeyObj]                                 // for decryption
    //             };
    //             return openpgp.decrypt(options).then(plaintext => {
    //                 resolve(plaintext.data);                     
    //             })
    //         }).catch(e=>{
    //             reject(e);
    //         });
    //     });
    // }
    static isValidJSON(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
}
module.exports = ParamUtils;