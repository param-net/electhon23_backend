const RLP = require("rlp");
const EthereumTx = require("ethereumjs-tx");
const rp = require('request-promise-native');

class ParamPrivateNode {

    static sendRawTransaction(options, connection) {

        const privateUrl = connection.privateUrl;
        const publicUrl = connection.publicUrl;
        return new Promise((resolve, reject) => {
            if (!options || !options.data) {
                reject("Invalid options!.")
                return;
            }

            if (!options.isPrivate) {
                ParamUtils.sendPublicRawTx(connection.web3, options.data, options).then(data => {
                    resolve(data);
                }).catch(e => {
                    reject(e);
                });
                return;
            }
            if (options.data.toLowerCase().startsWith('0x')) {
                options.data = options.data.substring(2);
            }
            const ParamUtils = require('./utils/index');
            const payload = ParamUtils.getHexToBase64(options.data)
            const from = options.privateFrom;
            const network_options = {
                method: "POST",
                uri: `${privateUrl}/storeraw`,
                json: true,
                body: { payload, from }
            };

            return rp(network_options).then(payload => {
                return ParamPrivateNode.sendRawReq(options, ParamUtils.getBase64ToHex(payload.key), connection);
            }).then(data => {
                resolve(data);
            }).catch(e => {
                console.log(JSON.stringify(options))
                reject(e);
            })
        });
    }

    static setPrivate(rawTransaction) {
        const decoded = RLP.decode(rawTransaction);
        const compareTo = Buffer.from("1c", "hex");
        if (decoded[6].compare(compareTo) === 0) {
            decoded[6] = Buffer.from("26", "hex");
        } else {
            decoded[6] = Buffer.from("25", "hex");
        }
        return RLP.encode(decoded);
    }

    static sendRawReq(options, payload, connection) {
        const publicURL = connection.publicUrl;
        let serializedTx = ParamPrivateNode.serializeSignedTransaction(options, payload);
        if (options.isPrivate) {
            serializedTx = ParamPrivateNode.setPrivate(serializedTx);
        }
        const publicPayload = `0x${serializedTx.toString("hex")}`;
        const privateFor = options.privateFor;
        let params = [publicPayload]
        if (options.isPrivate) {
            params = [publicPayload, { privateFor }]
        }
        delete options.privateFor;
        delete options.privateFrom;
        const sendRawPrivateTransactionRequest = {
            method: "POST",
            uri: publicURL,
            json: true,
            header: {
                'Access-Control-Allow-Origin': '*'
            },
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                jsonrpc: "2.0",
                method: "eth_sendRawPrivateTransaction",
                params: params,
                id: "1"
            }
        };
        if (publicURL.startsWith("http"))
            return rp(sendRawPrivateTransactionRequest);
        return new Promise((resolve, reject) => {
            connection.web3._requestManager.send(sendRawPrivateTransactionRequest.body, function (err, success) {
                if (err) {
                    return reject(err);
                }
                return resolve(success);
            })
        })
    }

    static serializeSignedTransaction(options, data) {
        const intToHex = int => {
            if (typeof (int) === "undefined") {
                return undefined;
            }
            return `0x${int.toString(16)}`;
        };
        if (!data) {
            data = "0x"
        }
        if (!data.toLowerCase().startsWith('0x')) {
            data = `0x${data}`;
        }

        let rawTransaction = {
            nonce: intToHex(options.nonce),
            from: options.from,
            to: options.to,
            gas: options.gas,
            data: data
        };
        if (options.value) {
            rawTransaction.value = intToHex(options.value);
        }
        if (options.gasPrice) {
            rawTransaction.gasPrice = intToHex(options.gasPrice);
        }
        const tx = new EthereumTx(rawTransaction);
        tx.sign(Buffer.from(options.privateKey, "hex"));

        const serializedTx = tx.serialize();
        return `0x${serializedTx.toString("hex")}`;
    }
}
module.exports = ParamPrivateNode;