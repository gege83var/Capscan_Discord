//node deploy-commands

const http = require('https');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction} = require('discord.js');
const { exit } = require('process');

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
              var body = Buffer.concat(chunks);
              resolve(body.toString());
            });
        });
          
        req.write(queryJson);
        req.end();
    })
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('transacs')
    .setDescription('Give all transactions for a wallet')
    .addStringOption(option =>
        option.setName('wallet')
        .setDescription('Enter a wallet')
        .setRequired(true)),
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute (interaction) {
        const wallet = interaction.options.getString('wallet');
        var queryJson = JSON.stringify({ query: 'query transacs{transferEntities(offset:0 filter: {or: [{to:{equalTo : "'+wallet+'"}}{from: {equalTo : "'+wallet+'"}}]}orderBy: TIMESTAMP_ASC){totalCount nodes {timestamp, amountRounded, to}}}'});
        RequestIndexer(queryJson).then(indexerReturnedValue => {
            
            let values = JSON.parse(indexerReturnedValue);

            //A modifier selon la réponse

            if(typeof(values.data.transferEntities.nodes[0]) != 'undefined'){
                const totalCount = values.data.transferEntities.totalCount;
                
                message = 'Wallet ' +  wallet.toString() + ' have ' + totalCount.toString() + ' transactions.\n';

                //TODO à modifier pour i<totalCount & pour >100 message

                for(let i=0; i<10;i++){
                    if(typeof(values.data.transferEntities.nodes[i]) != 'undefined'){
                        const date = values.data.transferEntities.nodes[i].timestamp.substring(0,10);
                        const hour = values.data.transferEntities.nodes[i].timestamp.substring(11,19);
                        const value = values.data.transferEntities.nodes[i].amountRounded;
                        //Met en négatif les montants s'ils sont partants
                        if(values.data.transferEntities.nodes[i].to !== wallet){
                            message += 'The  ' + date.toString() + ' at ' + hour.toString() + ' sent ' + value.toString() + ' $CAPS';
                        }else{
                            message += 'The  ' + date.toString() + ' at ' + hour.toString() + ' received ' + value.toString() + ' $CAPS';
                        }
                        
                        message += '\n';
                    }else{
                        exit;
                    }
                }
            }else{
                message = wallet.toString() + " Is an unknown wallet";
            }

            interaction.reply(message);
        });
    }
}

