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
    .setName('nft_collection')
    .setDescription('Give all informations of a collection')
    .addStringOption(option =>
        option.setName('collection_id')
        .setDescription('Enter an nft collection id')
        .setRequired(true)),
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute (interaction) {
        const collection_id = interaction.options.getString('collection_id');

        var queryJson = JSON.stringify({ query: 'query nftCollection{ nftEntities( offset: 0 filter: {collectionId: { equalTo: "'+collection_id+'"}} orderBy: [OWNER_ASC, COLLECTION_ID_ASC, NFT_ID_ASC]) {totalCount nodes {nftId,owner}}}'});
        RequestIndexer(queryJson).then(test => {
            
            let values = JSON.parse(test);

            //A modifier selon la réponse

            if(typeof(values.data.nftEntities.nodes[0]) != 'undefined'){
                const totalCount = values.data.nftEntities.totalCount;
    
                message = 'Collection n°' + collection_id.toString() + ' have ' + totalCount.toString() + ' NFT\n';

                //TODO à modifier pour i<totalCount & pour >100 message & mettre les id dans l'ordre croissant

                for(let i=0; i<10;i++){
                    if(typeof(values.data.nftEntities.nodes[i]) != 'undefined'){
                        const nftId = values.data.nftEntities.nodes[i].nftId;
                        const owner = values.data.nftEntities.nodes[i].owner;

                        message += 'Id : ' + nftId.toString() + ' is owned by : ' + owner.toString();
                        message += '\n';
                    }else{
                        exit;
                    }
                }
                
            }else{
                message = collection_id.toString() + " Is an unknown NFT collection";
            }

            interaction.reply(message);
        });
    }
}
