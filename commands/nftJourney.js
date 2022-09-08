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
    .setName('nft_journey')
    .setDescription('Give all informations on an nft')
    .addStringOption(option =>
        option.setName('nft_id')
        .setDescription('Enter an nft id')
        .setRequired(true)),
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute (interaction) {
        const nft_id = interaction.options.getString('nft_id');

        var queryJson = JSON.stringify({ query: 'query nftJourney{ nftOperationEntities( filter: {nftId: { equalTo: "'+nft_id+'"}}orderBy: TIMESTAMP_ASC) {totalCount nodes {timestamp,from,to,id}}}'});

        RequestIndexer(queryJson).then(indexerReturnedValue => {
            
            let values = JSON.parse(indexerReturnedValue);

            //A modifier selon la réponse

            if(typeof(values.data.nftOperationEntities.nodes[0]) != 'undefined'){
                const totalCount = values.data.nftOperationEntities.totalCount;
                
                message = 'Nft n° ' +  nft_id.toString() + ' have ' + totalCount.toString() + ' transactions.\n';

                //TODO à modifier pour i<totalCount & pour >100 message

                for(let i=0; i<10;i++){
                    if(typeof(values.data.nftOperationEntities.nodes[i]) != 'undefined'){
                        const date = values.data.nftOperationEntities.nodes[i].timestamp.substring(0,10);
                        const hour = values.data.nftOperationEntities.nodes[i].timestamp.substring(11,19);
                        var from = values.data.nftOperationEntities.nodes[i].from;
                        var to = values.data.nftOperationEntities.nodes[i].to;

                        if(from == null){from="null";}
                        if(to == null){to="null";}

                        message += 'The  ' + date.toString() + ' at ' + hour.toString() + ' the NFT goes from ' + from.toString() + ' to ' + to.toString();
                        message += '\n';
                    }else{
                        exit;
                    }
                }
            }else{
                message = nft_id.toString() + " Is an unknown nft_id";
            }

            interaction.reply(message);
        });
    }
}