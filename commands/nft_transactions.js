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

        try{
            const nft_id = interaction.options.getString('nft_id');
            var page = interaction.options.get('page');
            if(page == undefined){
                page = 1;
            }else{
                page = page.value;
            }
            const limit = 10;
            const offset = (page-1)*10;
    
            console.log("Nft Transactions "+nft_id+" "+offset);
    
            var queryJson = JSON.stringify({ query: 'query nftJourney{  nftEntity(id: "'+nft_id+'"){offchainData}	nftOperationEntities(    offset:'+offset+'    first:'+limit+'    filter: { nftId: { equalTo: "'+nft_id+'" } }    orderBy: TIMESTAMP_DESC  ) {    totalCount    nodes {      timestamp      from      to      priceRounded      id      typeOfTransaction      collectionId      royalty      auctionStartPriceRounded          }  }}'});
    
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
                            const collectionId = parsedNftInfosRequested.nftOperationEntities.nodes[i].collectionId;
                            const royalty = parsedNftInfosRequested.nftOperationEntities.nodes[i].royalty;
                            const auctionStartPrice = parsedNftInfosRequested.nftOperationEntities.nodes[i].auctionStartPriceRounded;
    
                            switch(typeOfTransaction){
                                //DEFAULT
                                case 'create':
                                    icon = ':baby:';
                                    val = func.walletUrl(to)+' mint the NFT';
                                    break;
                                case 'transfer':
                                    icon = ':left_right_arrow:';
                                    val = 'From : '+func.walletUrl(from)+'\nTo : '+func.walletUrl(to);
                                    break;
                                case 'list':
                                    icon = ':shopping_cart:';
                                    val = func.walletUrl(from)+' listed at '+price+' $CAPS';
                                    break;
                                case 'unlist':
                                    icon = ':red_car:';
                                    val = func.walletUrl(from)+' unlist his NFT';
                                    break;
                                case 'sell':
                                    icon = ':moneybag:';
                                    val = func.walletUrl(to)+' bought it';
                                    break;
                                case 'burn':
                                    icon = ':fire:';
                                    val = func.walletUrl(from)+' burn his NFT';
                                    break;
                                case 'addToCollection':
                                    icon = ':black_joker:';
                                    val = func.walletUrl(from)+' add the NFT to collection n°'+collectionId;
                                    break;
                                case 'setRoyalty':
                                    icon = ':person_with_crown:';
                                    val = func.walletUrl(from)+' set royalty to '+royalty+'%';
                                    break;
                                //AUCTIONS
                                case 'createAuction':
                                    icon = ':chart_with_upwards_trend:';
                                    val = func.walletUrl(from)+' createdAuction start at '+auctionStartPrice+' $CAPS';
                                    break;
                                case 'completeAuction':
                                    icon = ':judge:';
                                    if(from==to){
                                        val = func.walletUrl(from)+' had no bidders'
                                    }else{
                                        val = func.walletUrl(to)+' won the auction for '+price;
                                    }
                                    break;
                                case 'buyItNowAuction':
                                    icon = ':money_with_wings:';
                                    if(from==to){
                                        val = func.walletUrl(from)+' stopped the auction'
                                    }else{
                                        val = func.walletUrl(to)+' buy it now for '+price;
                                    }
                                    break;
                                case 'cancelAuction':
                                    icon = ':octagonal_sign:';
                                    val = func.walletUrl(from)+' canceled the auction';
                                    break;
                                //RENTAL
                                case 'rentalContractCreated':
                                    icon = ':printer:';
                                    val = func.walletUrl(from)+' created a new rental contract';
                                    break;
                                case 'rentalContractStarted':
                                    icon = ':newspaper:';
                                    val = func.walletUrl(to)+' accepted the contract';
                                    break;
                                case 'rentalContractCanceled':
                                    icon = ':wastebasket:';
                                    val = func.walletUrl(from)+' canceled the contract';
                                    break;
                                case 'rentalContractEnded':
                                    icon = ':newspaper2:';
                                    val = 'The contract has ended';
                                    break;
                                //DELEGATE
                                case 'delegate':
                                    icon = ':handshake:';
                                    val = 'Delegate to '+func.walletUrl(to);
                                    break;
                                case 'undelegate':
                                    icon = ':person_gesturing_no:';
                                    val = func.walletUrl(from)+' take back his NFT';
                                    break;
                                //BID
                                case 'addBid':
                                    icon = ':thumbsup:';
                                    val = func.walletUrl(from)+' has increase to '+price+' $CAPS';
                                    break;
                                case 'removeBid':
                                    icon = ':thumbsdown:';
                                    val = func.walletUrl(from)+' has removed his bid';
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
        }catch(e){
            console.log(e);
        }

    }
}