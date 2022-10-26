const func = require('../functions.js');
const { defaultValues } = require('../config.json');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('secret_estimated_rewards')
    .setDescription('Give an estimation of the number of CAPS rewarded for 1 point by Secret Stash'),

    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute (interaction) {

        try{
            console.log("Secret Stash");

            const dateObject = new Date();
    
            const year = dateObject.getFullYear().toString();
            const month = (`0${dateObject.getMonth()}`).slice(-2).toString();
            if(month=="00"){month="12"};
    
            var queryJson = JSON.stringify({ query: 'query secretEstimatedRewards{	transferEntities(		filter:{      to:{equalTo: "5GzjQQN2x9qcrGoeaYRwsWtcmT3NKzkpQwWtoYRf9p8EN5ht"}      timestamp: {greaterThan: "'+year+'-'+month+'-28T22:00:00"}    }  ){		totalCount    aggregates{			sum{				amountRounded      }    }  }    nftEntities(    offset:0    filter:{			collectionId: {in : ["82","83"]}      owner:{notEqualTo: "5GzjQQN2x9qcrGoeaYRwsWtcmT3NKzkpQwWtoYRf9p8EN5ht"}    }  ){    totalCount    groupedAggregates(groupBy:COLLECTION_ID){			keys      distinctCount{				nftId      }    }  }}'});
    
            parsedSecretEstimatedRewardsRequested = JSON.parse(await func.RequestIndexer(queryJson)).data;
    
            const embedMessage = new EmbedBuilder()
                .setTitle('Secret Stash')
                .setDescription('Estimation of the number of CAPS rewarded for 1 point')
                .setThumbnail(defaultValues.defaultThumbnail)
                .setURL('https://secret-stash.io/')
                .setFooter({ text: defaultValues.footerText, iconURL: defaultValues.footerIcon })
                .setColor(defaultValues.defaultColor)
            
            const capsWon = parsedSecretEstimatedRewardsRequested.transferEntities.aggregates.sum.amountRounded-1000;
            const nbOfComet = parsedSecretEstimatedRewardsRequested.nftEntities.groupedAggregates[0].distinctCount.nftId;
            const nbOfStar = parsedSecretEstimatedRewardsRequested.nftEntities.groupedAggregates[1].distinctCount.nftId;
            const totalNbPoints = parseInt(nbOfStar)+parseInt(nbOfComet*4);
    
            embedMessage.addFields({name: ':star: Number of star', value: nbOfStar+"/1000"});
            embedMessage.addFields({name: ':comet: Number of comet', value: nbOfComet+"/1000"});
            embedMessage.addFields({name: ':dart: Number of points', value: totalNbPoints+"/5000"});
            embedMessage.addFields({name: ':dollar: Estimated reward for 1 point', value: func.changeFloatForm(capsWon*0.2/totalNbPoints)+" $CAPS per point"});
    
            interaction.reply({ embeds: [embedMessage], ephemeral:defaultValues.ephemeral});
        }catch(e){
            console.log(e);
        }

    }
}
