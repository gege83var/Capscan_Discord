const http = require('https');

function changeFloatForm(val){
    return val.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&\'');
}

function changeIntForm(val){
    return val.toFixed(0).replace(/\d(?=(\d{3})+\.)/g, '$&\'');
}

function RequestIndexer(queryJson) {
    var options = {
        "method": "POST",
        "hostname": "indexer-mainnet.ternoa.dev",
        "port": null,
        "path": "/",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache"
        }
      };
    return new Promise((resolve) => {
        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
              chunks.push(chunk);
            });
          
            res.on("end", function () {
              try{
                var body = Buffer.concat(chunks);
                resolve(body.toString());
              }catch(err){
                console.log(err);
                resolve('error');
              }
            });

            req.on('error', error=>{
              resolve('error');
            });

        });
          
        req.write(queryJson);
        req.end();
    })
}

function RequestDictionary(queryJson) {
  var options = {
      "method": "POST",
      "hostname": "dictionary-mainnet.ternoa.dev",
      "port": null,
      "path": "/",
      "headers": {
          "content-type": "application/json",
          "cache-control": "no-cache"
      }
    };
  return new Promise((resolve) => {
      var req = http.request(options, function (res) {
          var chunks = [];

          res.on("data", function (chunk) {
            chunks.push(chunk);
          });
        
          res.on("end", function () {
            try{
              var body = Buffer.concat(chunks);
              resolve(body.toString());
            }catch(err){
              console.log(err);
              resolve('error');
            }
            
          });

          req.on('error', error=>{
            resolve('error');
          });
      });
        
      req.write(queryJson);
      req.end();
  })
}

function getCollectionName(offchainData) {
    var options = {
        "method": "GET",
        "hostname": "ipfs-mainnet.trnnfr.com",
        "port": null,
        "path": "/ipfs/"+encodeURI(offchainData)
      };
    return new Promise((resolve) => {
        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
              chunks.push(chunk);
            });
          
            res.on("end", function () {
              try{
                var body = JSON.parse(chunks);
                resolve(body);
              }catch(err){
                console.log(err);
                resolve('error');
              }        
            });

            req.on('error', error => {
                resolve('inconnu');
              });
        });
          
        req.end();
    })
}

function getNftInformations(offchainData) {
    var options = {
        "method": "GET",
        "hostname": "ipfs-mainnet.trnnfr.com",
        "port": null,
        "path": "/ipfs/"+encodeURI(offchainData)
      };
    return new Promise((resolve) => {
        var req = http.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
              chunks.push(chunk);
            });
          
            res.on("end", function () {
              try{
                var body = JSON.parse(chunks);
                resolve(body);
              }catch(err){
                console.log(err);
                resolve('error');
              }
            });

            req.on('error', error => {
                resolve('inconnu');
              });
        });
          
        req.end();
    })
}

function reduceWalletSize(wallet){
  if(wallet.length >=10){
    return wallet.substring(0,5)+'...'+wallet.substring(wallet.length-5,wallet.length);
  }
  return wallet;
}

function walletUrl(wallet){
  if(wallet != 'Null'){
    return '['+reduceWalletSize(wallet)+'](https://explorer.ternoa.com/account/'+wallet+')';
  }else{
    return 'Null';
  }
  
}

function nullToUnknown(val){
  if(val == null){
    return 'Null';
  }else{
    return val;
  }
}

module.exports = {
    changeFloatForm,
    changeIntForm,
    RequestIndexer,
    RequestDictionary,
    getCollectionName,
    getNftInformations,
    reduceWalletSize,
    walletUrl,
    nullToUnknown,
};

