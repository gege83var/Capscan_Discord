const func = require('../functions.js');
const { defaultValues } = require('../config.json');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    //A modifier selon la requête
    .setName('wallet_infos')
    .setDescription('Give some informations about a wallet')
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

        try{
            console.log("Wallet Infos "+wallet);

            var queryJson = JSON.stringify({ query: 'query infos{ accountEntities( filter: {id: { equalTo: "'+wallet+'"}}) {nodes {capsAmountRounded,capsAmountFrozenRounded,capsAmountTotalRounded}}}'});
    
            parsedInfosRequested = JSON.parse(await func.RequestIndexer(queryJson)).data.accountEntities.nodes[0];
    
            const embedMessage = new EmbedBuilder()
                .setThumbnail(defaultValues.defaultThumbnail)
                .setFooter({ text: defaultValues.footerText, iconURL: defaultValues.footerIcon });
    
            if(typeof(parsedInfosRequested) != 'undefined'){
                const freeCaps = parsedInfosRequested.capsAmountRounded;
                const frozenCaps = parsedInfosRequested.capsAmountFrozenRounded;
                const totalCaps = parsedInfosRequested.capsAmountTotalRounded;
    
                embedMessage.setTitle(func.reduceWalletSize(wallet));
                embedMessage.setDescription('Give some informations about a wallet');
                embedMessage.setURL('https://explorer.ternoa.com/account/'+wallet);
                embedMessage.setColor(defaultValues.goodRequestColor);
    
                embedMessage.addFields({name: ':money_with_wings: Free', value: func.changeFloatForm(freeCaps) + ' (' + func.changeFloatForm(freeCaps/totalCaps*100) + ' %)'});
                embedMessage.addFields({name: ':cold_face: Frozen', value: func.changeFloatForm(frozenCaps) + ' (' + func.changeFloatForm(frozenCaps/totalCaps*100) + ' %)'});
                embedMessage.addFields({name: ':moneybag: Total', value: func.changeFloatForm(totalCaps)});
                  
            }else{
                embedMessage.setTitle('Unknown wallet');
                embedMessage.setDescription(':interrobang: '+'\''+wallet.toString() + '\' is an unknown wallet');
                embedMessage.setColor(defaultValues.badRequestColor);    
            }
    
            interaction.reply({ embeds: [embedMessage], ephemeral:defaultValues.ephemeral});
        }catch(e){
            console.log(e);
        }
  
    }
}