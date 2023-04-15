class ParamNetwork {

    constructor(_config) {
        this.setConfig(_config);
    }

    setConfig(config) {
        if (!config) {
            return;
        }
        if (typeof this.map === "undefined") {
            this.map = {
                "electhon": []
            };
        }
        if (typeof this.web3 === "undefined") {
            let Web3 = require('web3');
            this.web3 = new Web3(this.getProvider(config));
            this.web3.privateurl = config.privateurl;
        }
        const Electhon = require('./vote/index');

        if (!config.contracts) {
            config.contracts = [
                { key: "electhon" }
            ]
        }
        for (let index = 0; index < config.contracts.length; index++) {
            let contractObj = config.contracts[index];
            let obj = null;
            switch (contractObj.key) {
                case "electhon":
                    obj = new Electhon(this, contractObj.address);
                    break;
                default:
                    break;
            }
            if (obj) {
                if (!this.getContract(contractObj.key, contractObj.address)) {
                    if (contractObj.address !== undefined) {
                        contractObj.address = contractObj.address.toLowerCase();
                    }
                    obj.contractAddress = contractObj.address;
                    this.map[contractObj.key].push(obj);
                }
            }
        }
    }

    get getElecthonbook() {
        return this.map["electhon"][0];
    }

    getElecthonBookManager(config) {
        let address = this.getContractAddress("electhon", config)
        return this.getContract("electhon", address);
    }

    getContract(contractName, contractAddress) {
        let contractArrayObject = this.map[contractName];
        if (!contractAddress) {
            return contractArrayObject[0];
        }
        for (let contractIndex in contractArrayObject) {
            if (contractArrayObject[contractIndex].contractAddress === contractAddress) {
                return contractArrayObject[contractIndex];
            }
        }
        return null;
    }

    getContractAddress(contractName, config) {
        if (!config || config.contracts === undefined) {
            return null;
        }
        let contractObj = config.contracts;
        for (let i = 0; i < contractObj.length; i++) {
            if (contractObj[i].key === contractName && contractObj[i].address !== undefined && contractObj[i].address !== null) {
                return contractObj[i].address.toLowerCase();
            }
        }
        return null;
    }

    getProvider(config) {
        this.config = config;
        let Web3 = require('web3');
        if (config.url.startsWith("http")) {
            if (config.enableCors) {
                let HttpHeaderProvider = require('httpheaderprovider');
                const CORS_HEADERS = {
                    'Access-Control-Allow-Origin': '*'
                }
                return new HttpHeaderProvider(config.url, CORS_HEADERS);
            }
            return new Web3.providers.HttpProvider(config.url);
        }
        return new Web3.providers.WebsocketProvider(config.url);
    }

    getConfig() {
        return this.web3;
    }

    getConnection() {
        return this.web3;
    }
}
module.exports = ParamNetwork;