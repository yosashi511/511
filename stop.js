const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('إيقاف البوت'),
    async execute(interaction) {
        try {
            // إرسال رسالة تأكيد
            await interaction.reply({
                content: 'جاري إيقاف البوت...',
                ephemeral: true
            });

            // إعطاء وقت للرسالة لتصل قبل إيقاف البوت
            setTimeout(() => {
                // تنظيف وإيقاف البوت
                interaction.client.destroy();
                process.exit(0);
            }, 1000);
        } catch (error) {
            console.error('خطأ في تنفيذ أمر stop:', error);
            await interaction.reply({
                content: 'حدث خطأ أثناء محاولة إيقاف البوت.',
                ephemeral: true
            });
        }
    },
};