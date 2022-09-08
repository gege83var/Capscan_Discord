const {Client, COmmandInteraction } = require('discord.js');

/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 */
const handleCommand = async (client, interaction) => {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error){
        console.log(error);
        await interaction.reply({content: "Error during command execution ", ephemeral: true });
    }
}

module.exports = handleCommand;