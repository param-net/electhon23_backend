class Web3_1_0 {
 static upgradeEventData(data){
     if(!data){
         return data;
     }
     if(data.args){
        return data;
     }
     data["args"] = data.returnValues;
     data.returnValues = undefined;
     return data;
 }
}
module.exports = Web3_1_0;