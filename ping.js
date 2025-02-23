
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('يرد عليك بـ Pong!'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        
        await interaction.editReply({
            content: `Pong! 🏓\nBot Latency: ${ping}ms\nAPI Latency: ${interaction.client.ws.ping}ms`
        });
    }
};
