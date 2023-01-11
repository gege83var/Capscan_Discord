const func = require('../functions.js');
const { defaultValues } = require('../config.json');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('nft_infos')
    .setDescription('Give some informations about an NFT')
    .addStringOption(option =>
        option.setName('nft_id')
        .setDescription('Enter an nft id')
        .setRequired(true)),
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute (interaction) {

        try{
            const nft_id = interaction.options.getString('nft_id');
            const limit = 10;
            const offset = 0;
    
            console.log("Nft infos "+nft_id);
    
            var queryJson = JSON.stringify({ query: 'query nftInfos{nftEntities(offset:'+offset+' first:'+limit+' filter:{nftId:{equalTo:"'+nft_id+'"}}orderBy:[TIMESTAMP_CREATE_ASC]){nodes{nftId,collectionId,owner,offchainData,timestampCreate}}}'});
            
            parsedNftInfosRequested = (JSON.parse(await func.RequestIndexer(queryJson))).data.nftEntities.nodes[0];
    
            const embedMessage = new EmbedBuilder()            
                .setFooter({ text: defaultValues.footerText, iconURL: defaultValues.footerIcon });
    
            if(typeof(parsedNftInfosRequested) != 'undefined'){
                const date = func.nullToUnknown(parsedNftInfosRequested.timestampCreate.substring(0,10));
                const hour = func.nullToUnknown(parsedNftInfosRequested.timestampCreate.substring(11,19));
                const owner = func.nullToUnknown(parsedNftInfosRequested.owner);
                const offchainData = func.nullToUnknown(parsedNftInfosRequested.offchainData);
    
                //Cas particulier du offchainData
    
                if((offchainData.length) >= 46){
                    nftInformations = await func.getNftInformations(parsedNftInfosRequested.offchainData);
                    embedMessage.setTitle('Nft ' + nftInformations.title);
                    embedMessage.setDescription(nftInformations.description);
                    embedMessage.setThumbnail('https://ipfs-mainnet.trnnfr.com/ipfs/'+nftInformations.image);
                    embedMessage.setColor(defaultValues.goodRequestColor);
        
                    embedMessage.addFields({ name: 'Collection ID', value: func.nullToUnknown(parsedNftInfosRequested.collectionId).toString() });
                    embedMessage.addFields({ name: ':bust_in_silhouette: Owner', value: func.walletUrl(owner)});
                    embedMessage.addFields({ name: ':hourglass_flowing_sand: Created date', value: 'The  ' + date.toString() + ' at ' + hour.toString() });
                }else{
                    embedMessage.setTitle('INVALID OFFCHAIN DATA');
                    embedMessage.setDescription('INVALID OFFCHAIN DATA');
                    embedMessage.setThumbnail(defaultValues.defaultThumbnail);
                    embedMessage.setColor(defaultValues.defaultColor);
    
                    embedMessage.addFields({ name: 'Collection ID unknown', value: 'Unknown'});
                    embedMessage.addFields({ name: ':bust_in_silhouette: Owner', value: func.walletUrl(owner)});
                    embedMessage.addFields({ name: ':hourglass_flowing_sand: Created date', value: 'The  ' + date.toString() + ' at ' + hour.toString() });
                }
    
                
            }else{
                embedMessage.setTitle('Unknown nft');
                embedMessage.setDescription(':interrobang: \''+nft_id+'\' is an unknwon NFT id');
                embedMessage.setThumbnail(defaultValues.defaultThumbnail);
                embedMessage.setColor(defaultValues.badRequestColor);
            }
            
            interaction.reply({ embeds: [embedMessage], ephemeral:defaultValues.ephemeral });
        }catch(e){
            console.log(e);
        }

    }
}