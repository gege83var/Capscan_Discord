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
    .setName('nft_infos')
    .setDescription('Give all nft owned by a wallet')
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

        var queryJson = JSON.stringify({ query: 'query nftInfos{ nftEntities( offset: 0 filter: {owner: {equalTo: "'+wallet+'"}} orderBy: [COLLECTION_ID_ASC, NFT_ID_ASC]) {totalCount nodes {nftId, collectionId}}}'});
        
        RequestIndexer(queryJson).then(indexerReturnedValue => {
            
            let values = JSON.parse(indexerReturnedValue);

            //A modifier selon la réponse

            if(typeof(values.data.nftEntities.nodes[0]) != 'undefined'){
                const totalCount = values.data.nftEntities.totalCount;

                message = 'Wallet :' + wallet.toString() + ' have ' + totalCount.toString() + ' NFT\n';

                //TODO à modifier pour i<totalCount & pour >100 message & mettre les id dans l'ordre croissant

                for(let i=0; i<10;i++){
                    if(typeof(values.data.nftEntities.nodes[i]) != 'undefined'){
                        const collectionId = values.data.nftEntities.nodes[i].collectionId;
                        const nftId = values.data.nftEntities.nodes[i].nftId;
                        
                        message += 'CollectionId : ' + collectionId.toString() + ' with nft id : ' + nftId.toString();
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