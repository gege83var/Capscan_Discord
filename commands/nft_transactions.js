const func = require('../functions.js');
const { defaultValues } = require('../config.json');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { exit, off } = require('process');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('nft_transactions')
    .setDescription('Give transactions for an NFT')
    .addStringOption(option =>
        option.setName('nft_id')
        .setDescription('Enter an nft id')
        .setRequired(true))
    .addIntegerOption(option =>
        option.setName('page')
        .setDescription('Enter the page you want to see')
        .setRequired(false)
        .setMinValue(1)),
    
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
     async execute (interaction) {
        const nft_id = interaction.options.getString('nft_id');
        var page = interaction.options.get('page');
        if(page == undefined){
            page = 1;
        }else{
            page = page.value;
        }
        const limit = 10;
        const offset = (page-1)*10;

        var queryJson = JSON.stringify({ query: 'query nftJourney{  nftEntity(id: "'+nft_id+'"){offchainData}	nftOperationEntities(    offset:'+offset+'    first:'+limit+'    filter: { nftId: { equalTo: "'+nft_id+'" } }    orderBy: TIMESTAMP_DESC  ) {    totalCount    nodes {      timestamp      from      to      priceRounded      id      typeOfTransaction          }  }}'});

        parsedNftInfosRequested = (JSON.parse(await func.RequestIndexer(queryJson))).data;

        const embedMessage = new EmbedBuilder()
            .setFooter({ text: defaultValues.footerText, iconURL: defaultValues.footerIcon });

            if(parsedNftInfosRequested.nftEntity != null){

                if(parsedNftInfosRequested.nftEntity.offchainData.length >= 46){
                    nftInformations = await func.getNftInformations(parsedNftInfosRequested.nftEntity.offchainData);

                    embedMessage.setTitle('Nft ' + nftInformations.title + ' have ' + func.changeIntForm(parsedNftInfosRequested.nftOperationEntities.totalCount) + ' transactions');
                    embedMessage.setDescription(nftInformations.description);
                    embedMessage.setThumbnail('https://ipfs-mainnet.trnnfr.com/ipfs/'+nftInformations.image);
                    embedMessage.setColor(defaultValues.goodRequestColor);
                }else{
                    embedMessage.setTitle('INVALID OFFCHAIN DATA');
                    embedMessage.setDescription('INVALID OFFCHAIN DATA');
                    embedMessage.setThumbnail(defaultValues.defaultThumbnail);
                    embedMessage.setColor(defaultValues.defaultColor);
                }         
                for(let i=0; i<limit;i++){
                    if(typeof(parsedNftInfosRequested.nftOperationEntities.nodes[i]) != 'undefined'){
                        const date = parsedNftInfosRequested.nftOperationEntities.nodes[i].timestamp.substring(0,10);
                        const hour = parsedNftInfosRequested.nftOperationEntities.nodes[i].timestamp.substring(11,19);
                        const from = parsedNftInfosRequested.nftOperationEntities.nodes[i].from;
                        const to = parsedNftInfosRequested.nftOperationEntities.nodes[i].to;
                        const price =  parsedNftInfosRequested.nftOperationEntities.nodes[i].priceRounded;
                        const typeOfTransaction = parsedNftInfosRequested.nftOperationEntities.nodes[i].typeOfTransaction;

                        switch(typeOfTransaction){
                            case 'create':
                                icon = ':baby:';
                                val = func.walletUrl(to)+' mint the NFT';
                                break;
                            case 'transfer':
                                icon = ':left_right_arrow:';
                                val = 'From : '+func.walletUrl(from)+'\nTo : '+func.walletUrl(to);
                                break;
                            case 'list':
                                icon = ':judge:';
                                val = func.walletUrl(from)+' listed at '+price+' $CAPS';
                                break;
                            case 'sell':
                                icon = ':moneybag:';
                                val = func.walletUrl(to)+' bought it';
                                break;
                            case 'delegate':
                                icon = ':handshake:';
                                val = 'Delegate to '+func.walletUrl(to);
                                break;
                            case 'undelegate':
                                icon = ':person_gesturing_no:';
                                val = func.walletUrl(from)+' take back his NFT';
                                break;
                            default:
                                icon = ':question:';
                                val = 'Unknown transaction';
                        }
                        embedMessage.addFields({ name: icon+' The  ' + date.toString() + ' at ' + hour.toString(), value: val });
                    }else{
                        exit;
                    }
                }

            }else{
                embedMessage.setTitle('Unknown nft');
                embedMessage.setDescription(':interrobang: \''+nft_id+'\' is an unknwon NFT id');
                embedMessage.setThumbnail(defaultValues.defaultThumbnail);
                embedMessage.setColor(defaultValues.badRequestColor);
            }
        
        interaction.reply({ embeds: [embedMessage], ephemeral:defaultValues.ephemeral });
    }
}