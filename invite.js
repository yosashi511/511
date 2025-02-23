const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('عرض معلومات الدعوات'),
    async execute(interaction) {
        // توجيه المستخدم لاستخدام الأمر الجديد
        await interaction.reply({
            content: 'الرجاء استخدام الأمر `/invites` للحصول على معلومات الدعوات المفصلة.',
            ephemeral: true
        });
    }
};