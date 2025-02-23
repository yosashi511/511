const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('يُرسل إمبد مع معلومات مخصصة'),

    async execute(interaction) {
        try {
            const modal = new ModalBuilder()
                .setCustomId(`embedModal-${interaction.channelId}`)
                .setTitle('إنشاء رسالة مدمجة');

            const titleInput = new TextInputBuilder()
                .setCustomId('embedTitle')
                .setLabel('العنوان')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('أدخل العنوان هنا')
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(256);

            const descriptionInput = new TextInputBuilder()
                .setCustomId('embedDescription')
                .setLabel('المحتوى')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('أدخل المحتوى هنا')
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(2000); // تقليل الحد الأقصى للمحتوى

            const imageInput = new TextInputBuilder()
                .setCustomId('embedImage')
                .setLabel('رابط الصورة (اختياري)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('أدخل رابط الصورة هنا (اختياري)')
                .setRequired(false)
                .setMaxLength(500);

            const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
            const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(imageInput);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            await interaction.showModal(modal);
        } catch (error) {
            console.error('خطأ في تنفيذ أمر embed:', error);
            await interaction.reply({ 
                content: 'حدث خطأ أثناء إنشاء النموذج. الرجاء المحاولة مرة أخرى.', 
                ephemeral: true 
            });
        }
    },
};