//node deploy-commands

const http = require('https');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {CommandInteraction} = require('discord.js');

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
    //A modifier selon la requête
    .setName('infos')
    .setDescription('Give all informations for a wallet')
    .addStringOption(option =>
        option.setName('wallet')
        .setDescription('Enter a wallet')
        .setRequired(true)),
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute (interaction) {
        //A modifier selon la query
        const wallet = interaction.options.getString('wallet');

        var queryJson = JSON.stringify({ query: 'query infos{ accountEntities( filter: {id: { equalTo: "'+wallet+'"}}) {nodes {capsAmountRounded,capsAmountFrozenRounded,capsAmountTotalRounded}}}'});

        RequestIndexer(queryJson).then(indexerReturnedValue => {
            
            let values = JSON.parse(indexerReturnedValue);

            //A modifier selon la réponse

            if(typeof(values.data.accountEntities.nodes[0]) != 'undefined'){
                const freeCaps = values.data.accountEntities.nodes[0].capsAmountRounded;
                const frozenCaps = values.data.accountEntities.nodes[0].capsAmountFrozenRounded;
                const totalCaps = values.data.accountEntities.nodes[0].capsAmountTotalRounded;
    
                message = wallet.toString() + ' have :\n' + freeCaps.toString() + ' Free $CAPS\n' + frozenCaps.toString() + ' Frozen $CAPS\nFor a total of : ' + totalCaps.toString() + ' $CAPS';    
            }else{
                message = wallet.toString() + " Is an unknown wallet";
            }

            interaction.reply(message);
        });
    }
}