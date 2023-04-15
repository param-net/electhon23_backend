const ParamNetwork = require('../index');

let paramNetwork = new ParamNetwork({ url: "ws://34.224.243.54:8546/" });

let electhon = paramNetwork.getElecthonBookManager();

const options = {
    "from": "0x34EceA484fDc69ebe29E26f32828e1e203D7c0a8",
    "privateKey": "2847ec0b5c56e0a97e95e49b1eea363e80633b923296cd311a254588da67c71e"
}

let metaInfo = "{Name:muthu}"
let primaryID = "aadhar"
let idType = "1"

/* electhon.addUser(metaInfo, primaryID, idType, options).then(data => {
    console.log('TxnHash ', data);
}) */

/* electhon.getCandidate(options.from).then(data => {
    console.log('TxnHash ', data);
}) */

/* electhon.getVotingStatus(options.from).then(data => {
    console.log('TxnHash ', data);
}) */

/* electhon.getAllUsers("0xc3ab9670c93bca0c1c35db0538d8c45ff99862e7").then(data => {
    console.log('TxnHash ', data);
}) */

electhon.getUser("0x0cA3794A150fBE3dA807D777933d64eE7733E4DE").then(data => {
    console.log('TxnHash ', data);
})