const fs = require('fs');
const {Client, Collection, GatewayIntentBits } = require('discord.js');
const {token} = require('./config.json');

const handleCommand = require('./helpers/command');

const client = new Client({intents : [GatewayIntentBits.GuildMessages]});

require('./deploy-commands.js');

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log('Bot ready !');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) handleCommand(client, interaction);
})

client.login(token);