const func = require('../functions.js');
const { defaultValues } = require('../config.json');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ternoa_infos')
    .setDescription('Give some informations about Ternoa'),

    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute (interaction) {

        var queryJson = JSON.stringify({ query: 'query totalCapsInCirculation {  accountEntities(offset: 0) {    totalCount    aggregates {      sum {        capsAmountRounded      }      sum {        capsAmountFrozenRounded      }      sum {        capsAmountTotalRounded      }    }  }}'});

        parsedGeneralInformationsRequested = JSON.parse(await func.RequestIndexer(queryJson)).data.accountEntities;

        const embedMessage = new EmbedBuilder()
            .setTitle('Ternoa')
            .setDescription('General informations about Ternoa')
            .setThumbnail(defaultValues.defaultThumbnail)
            .setURL('https://www.ternoa.com/')
            .setFooter({ text: defaultValues.footerText, iconURL: defaultValues.footerIcon })
            .setColor(defaultValues.defaultColor)
        
        const totalAccount = parsedGeneralInformationsRequested.totalCount;
        const totalFreeCaps = parsedGeneralInformationsRequested.aggregates.sum.capsAmountRounded;
        const totalFrozenCaps = parsedGeneralInformationsRequested.aggregates.sum.capsAmountFrozenRounded;
        const totalCaps = parsedGeneralInformationsRequested.aggregates.sum.capsAmountTotalRounded;

        embedMessage.addFields({name: ':busts_in_silhouette: Number of wallet', value: func.changeIntForm(totalAccount)});
        embedMessage.addFields({name: ':money_with_wings: Total free', value: func.changeFloatForm(totalFreeCaps) + ' (' + func.changeFloatForm(totalFreeCaps/totalCaps*100) + ' %)'});
        embedMessage.addFields({name: ':cold_face: Total frozen', value: func.changeFloatForm(totalFrozenCaps) + ' (' + func.changeFloatForm(totalFrozenCaps/totalCaps*100) + ' %)'});
        embedMessage.addFields({name: ':moneybag: Total', value: func.changeFloatForm(totalCaps)});

        interaction.reply({ embeds: [embedMessage], ephemeral:defaultValues.ephemeral});

        
    }
}
