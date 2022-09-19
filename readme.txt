This bot is created by an initiative of Tiime Engine Angels.
The goal is to create an interface to use the Ternoa indexer via Discord. The code is made public so that everyone can appropriate it and make it evolve together. 

#Add the bot to your server :
https://discord.com/oauth2/authorize?client_id=1017089081626349599&permissions=0&scope=bot%20applications.commands

#Implement the bot by yourself

-clone the repository

-Create config.json with :
{
    "token": "YOUR TOKEN",
    "guildId": "YOUR DISCORD SERVER ID",
    "clientId": "YOUR CLIENT ID",
    "defaultValues":{
        "defaultThumbnail": "https://www.ternoa.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fternoa-token-header.2f9657ab.png&w=384&q=75",
        "footerText": "Powered by Tiime Angels (with love)",
        "footerIcon": "https://www.tiime-engine.com/images/favicon.png",
        "defaultColor": "0xd804ca",
        "goodRequestColor": "0x4e33f8",
        "badRequestColor": "0xff1d4d",
        "ephemeral": true
    }
}

-The token & clientId is obtained here : https://discord.com/developers/applications/ By creating a new bot
-Guild id is founded directly on Discord with developper mod

-npm install
-node index.js

To install your bot on discord https://discord.com/oauth2/authorize?client_id=XXXXX&permissions=0&scope=bot%20applications.commands

And change the client_id by your in the discord dev applications

Enjoy :)
