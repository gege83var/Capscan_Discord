const func = require('../functions.js');
const { defaultValues } = require('../config.json');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('collection_infos')
    .setDescription('Give some informations about an NFT collection')
    .addStringOption(option =>
        option.setName('collection_id')
        .setDescription('Enter an nft collection id')
        .setRequired(true)),
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute (interaction) {
        
        try{
            const collection_id = interaction.options.getString('collection_id');
            const limit = 10;
            const offset = 0;
    
            console.log("Collection Infos "+collection_id);
    
            var queryJson = JSON.stringify({ query: 'query nftCollection{collectionEntity(id: "'+collection_id+'"){offchainData}nftEntities(offset: '+offset+' first:'+limit+' filter: { collectionId: { equalTo: "'+collection_id+'" } }orderBy: [TIMESTAMP_CREATE_ASC]) {totalCount nodes {nftId,collectionId,owner,offchainData,timestampCreate}}}'});
            
            parsedNftCollectionsRequested = (JSON.parse(await func.RequestIndexer(queryJson))).data;
    
            const embedMessage = new EmbedBuilder()
                .setFooter({ text: defaultValues.footerText, iconURL: defaultValues.footerIcon });
    
            if(parsedNftCollectionsRequested.collectionEntity != null){
    
                if(parsedNftCollectionsRequested.collectionEntity.offchainData.length >= 46){
                    collectionInformations = await func.getCollectionName(parsedNftCollectionsRequested.collectionEntity.offchainData);
    
                    embedMessage.setTitle('Collection ' + collectionInformations.name);
                    embedMessage.setDescription(collectionInformations.description);
                    embedMessage.setThumbnail('https://ipfs-mainnet.trnnfr.com/ipfs/'+collectionInformations.profile_image);
                    embedMessage.setColor(defaultValues.goodRequestColor);
                }else{
                    embedMessage.setTitle('INVALID OFFCHAIN DATA');
                    embedMessage.setDescription('INVALID OFFCHAIN DATA');
                    embedMessage.setThumbnail(defaultValues.defaultThumbnail);
                    embedMessage.setColor(defaultValues.defaultColor);
                }
    
                embedMessage.addFields({ name: 'Number of NFTs', value: parsedNftCollectionsRequested.nftEntities.totalCount.toString() });
                embedMessage.addFields({ name: 'Verified collection', value: ':white_check_mark: :warning: :x: not implemented, be aware of scams !'});   
            }else{
                embedMessage.setTitle('Unknown collection');
                embedMessage.setDescription(':interrobang: \'' + collection_id + '\' is an unknown collection id');
                embedMessage.setThumbnail(defaultValues.defaultThumbnail);
                embedMessage.setColor(defaultValues.badRequestColor);
            }
    
            interaction.reply({ embeds: [embedMessage], ephemeral:defaultValues.ephemeral });
        }catch(e){
            console.log(e);
        }
    }    
}