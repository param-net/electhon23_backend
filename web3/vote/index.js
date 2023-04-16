const ParamUtils = require('../utils/index');

class Electhon {

    constructor(_paramNetwork, contractAddress) {
        this.connection = _paramNetwork.getConnection();
        const electhonManager = require('./electhon.json');

        this.paramNetwork = _paramNetwork;
        this.electhonManagerContract = new this.connection.eth.Contract(electhonManager.abi, contractAddress ? contractAddress : electhonManager.address);
        this.to = electhonManager.address;
    }

    addCandidate(metaInfo, primaryID, idType, options) {
        const promise = new Promise((resolve, reject) => {
            const that = this;
            this.electhonManagerContract.methods.addCandidate(metaInfo, primaryID, idType).estimateGas(options, function (error, _gas) {
                if (error) {
                    return reject(error);
                }
                _gas = parseInt(_gas * 1.3);
                options.gas = _gas;
                options.to = that.to;

                if (options.privateKey) {
                    let txData = that.electhonManagerContract.methods.addCandidate(metaInfo, primaryID, idType).encodeABI()
                    ParamUtils.submitTransaction(that.connection, txData, options).then((data) => {
                        resolve(data)
                    }).catch(error => {
                        reject(error)
                    })
                    return;
                }
                that.electhonManagerContract.methods.addCandidate(metaInfo, primaryID, idType, options).send(function (error, data) {
                    if (error) {
                        return reject(error);
                    }
                    resolve(data)
                })
            })
        });
        return promise;
    }

    addUser(metaInfo, primaryID, idType, options) {
        const promise = new Promise((resolve, reject) => {
            const that = this;
            this.electhonManagerContract.methods.addUsers(metaInfo, primaryID, idType).estimateGas(options, function (error, _gas) {
                if (error) {
                    return reject(error);
                }
                _gas = parseInt(_gas * 1.3);
                options.gas = _gas;
                options.to = that.to;

                if (options.privateKey) {
                    let txData = that.electhonManagerContract.methods.addUsers(metaInfo, primaryID, idType).encodeABI()
                    ParamUtils.submitTransaction(that.connection, txData, options).then((data) => {
                        resolve(data)
                    }).catch(error => {
                        reject(error)
                    })
                    return;
                }
                that.electhonManagerContract.methods.addUsers(metaInfo, primaryID, idType, options).send(function (error, data) {
                    if (error) {
                        return reject(error);
                    }
                    resolve(data)
                })
            })
        });
        return promise;
    }

    giveVoting(userAddress, voteType, options) {
        const promise = new Promise((resolve, reject) => {
            const that = this;
            this.electhonManagerContract.methods.giveVoting(userAddress, voteType).estimateGas(options, function (error, _gas) {
                if (error) {
                    return reject(error);
                }
                _gas = parseInt(_gas * 1.3);
                options.gas = _gas;
                options.to = that.to;

                if (options.privateKey) {
                    let txData = that.electhonManagerContract.methods.giveVoting(userAddress, voteType).encodeABI()
                    ParamUtils.submitTransaction(that.connection, txData, options).then((data) => {
                        resolve(data)
                    }).catch(error => {
                        reject(error)
                    })
                    return;
                }
                that.electhonManagerContract.methods.giveVoting(userAddress, voteType, options).send(function (error, data) {
                    if (error) {
                        return reject(error);
                    }
                    resolve(data)
                })
            })
        });
        return promise;
    }

    enableAbsolute(options) {
        const promise = new Promise((resolve, reject) => {
            const that = this;
            this.electhonManagerContract.methods.enableAbsolute().estimateGas(options, function (error, _gas) {
                if (error) {
                    return reject(error);
                }
                _gas = parseInt(_gas * 1.3);
                options.gas = _gas;
                options.to = that.to;

                if (options.privateKey) {
                    let txData = that.electhonManagerContract.methods.enableAbsolute().encodeABI()
                    ParamUtils.submitTransaction(that.connection, txData, options).then((data) => {
                        resolve(data)
                    }).catch(error => {
                        reject(error)
                    })
                    return;
                }
                that.electhonManagerContract.methods.enableAbsolute(options).send(function (error, data) {
                    if (error) {
                        return reject(error);
                    }
                    resolve(data)
                })
            })
        });
        return promise;
    }

    disableAbsolute(options) {
        const promise = new Promise((resolve, reject) => {
            const that = this;
            this.electhonManagerContract.methods.disableAbsolute().estimateGas(options, function (error, _gas) {
                if (error) {
                    return reject(error);
                }
                _gas = parseInt(_gas * 1.3);
                options.gas = _gas;
                options.to = that.to;

                if (options.privateKey) {
                    let txData = that.electhonManagerContract.methods.disableAbsolute().encodeABI()
                    ParamUtils.submitTransaction(that.connection, txData, options).then((data) => {
                        resolve(data)
                    }).catch(error => {
                        reject(error)
                    })
                    return;
                }
                that.electhonManagerContract.methods.disableAbsolute(options).send(function (error, data) {
                    if (error) {
                        return reject(error);
                    }
                    resolve(data)
                })
            })
        });
        return promise;
    }

    getAllUsers(address) {
        const promise = new Promise((resolve, reject) => {
            this.electhonManagerContract.methods.getAllUsers(address).call(function (error, data) {
                if (error) {
                    return reject(error);
                }
                resolve(data)
            })
        });
        return promise;
    }

    getAllCandidates(owner) {
        const promise = new Promise((resolve, reject) => {
            this.electhonManagerContract.methods.getAllCandidates(owner).call(function (error, data) {
                if (error) {
                    return reject(error);
                }
                resolve(data)
            })
        });
        return promise;
    }

    getUser(owner) {
        const promise = new Promise((resolve, reject) => {
            this.electhonManagerContract.methods.getUser(owner).call(function (error, data) {
                if (error) {
                    return reject(error);
                }
                resolve(data)
            })
        });
        return promise;
    }

    getCandidate(owner) {
        const promise = new Promise((resolve, reject) => {
            this.electhonManagerContract.methods.getCandidate(owner).call(function (error, data) {
                if (error) {
                    return reject(error);
                }
                resolve(data)
            })
        });
        return promise;
    }

    getVotingStatus(owner) {
        const promise = new Promise((resolve, reject) => {
            this.electhonManagerContract.methods.getVotingStatus(owner).call(function (error, data) {
                if (error) {
                    return reject(error);
                }
                resolve(data)
            })
        });
        return promise;
    }
}

module.exports = Electhon;