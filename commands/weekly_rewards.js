const func = require('../functions.js');
const { defaultValues } = require('../config.json');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { exit } = require('process');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('weekly_rewards')
    .setDescription('Give weekly rewards for a wallet')
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
        const limit = 10;
        const offset = 0;

        var queryJson = JSON.stringify({ query: 'query WeeklyRewards {  transferEntities(    offset: '+offset+'  first: '+limit+'  filter: {      and: [        { from: { equalTo: "5Cd7mevfYYwVRyeNAqcBPSzJqHyohy7HF71bRHv83Fee91q2" }}        { to: { equalTo: "'+wallet+'" }}       ]    }    orderBy: TIMESTAMP_DESC  ) {    totalCount    nodes {      timestamp      amountRounded    }  }}'});
        
        parsedTransacsRequested = JSON.parse(await func.RequestIndexer(queryJson)).data.transferEntities;

        const embedMessage = new EmbedBuilder()
            .setThumbnail(defaultValues.defaultThumbnail)
            .setFooter({ text: defaultValues.footerText, iconURL: defaultValues.footerIcon });

        if(parsedTransacsRequested.totalCount > 0){
            embedMessage.setTitle(func.reduceWalletSize(wallet) + ' have ' + func.changeIntForm(parsedTransacsRequested.totalCount) + ' transactions');
            embedMessage.setDescription('Give weekly rewards for a wallet');
            embedMessage.setURL('https://explorer.ternoa.com/account/'+wallet);
            embedMessage.setColor(defaultValues.goodRequestColor);

            for(let i=0; i<limit;i++){
                if(typeof(parsedTransacsRequested.nodes[i]) != 'undefined'){
                    const date = parsedTransacsRequested.nodes[i].timestamp.substring(0,10);
                    const hour = parsedTransacsRequested.nodes[i].timestamp.substring(11,19);
                    const value = parsedTransacsRequested.nodes[i].amountRounded;

                    embedMessage.addFields({ name: 'The  ' + date.toString() + ' at ' + hour.toString(), value: ':inbox_tray: \u200b \u200b ' + func.changeFloatForm(value) + ' $CAPS (received)' });
                }else{
                    exit;
                }
            }
        }else{
            embedMessage.setTitle('Unknwon wallet');
            embedMessage.setDescription(':interrobang: \''+wallet.toString() + '\' is an unknown wallet');
            embedMessage.setColor(defaultValues.badRequestColor);
        }
        interaction.reply({ embeds: [embedMessage], ephemeral:defaultValues.ephemeral});
    }
}