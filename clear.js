const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('حذف')
        .setDescription('حذف عدد محدد من الرسائل من الروم')
        .addIntegerOption(option =>
            option.setName('عدد')
                .setDescription('عدد الرسائل المراد حذفها')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000)),

    async execute(interaction) {
        try {
            // التحقق من صلاحيات المستخدم
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return await interaction.reply({
                    content: '❌ ليس لديك صلاحية حذف الرسائل',
                    ephemeral: true
                });
            }

            const amount = interaction.options.getInteger('عدد');

            // حذف الرسائل
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            const deletedMessages = await interaction.channel.bulkDelete(messages, true);

            // إرسال تأكيد
            await interaction.reply({
                content: `✅ تم حذف ${deletedMessages.size} رسالة بنجاح`,
                ephemeral: true
            });

        } catch (error) {
            console.error('خطأ في تنفيذ أمر الحذف:', error);

            // رسالة خطأ مخصصة للرسائل القديمة
            if (error.code === 50034) {
                await interaction.reply({
                    content: '❌ لا يمكن حذف الرسائل التي مر عليها أكثر من 14 يوم',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '❌ حدث خطأ أثناء محاولة حذف الرسائل',
                    ephemeral: true
                });
            }
        }
    },
};