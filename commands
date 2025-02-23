
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    ping: {
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
    },
    
    embed: {
        data: new SlashCommandBuilder()
            .setName('embed')
            .setDescription('يُرسل إمبد مع معلومات مخصصة'),
        async execute(interaction) {
            await interaction.reply({ content: 'تم إرسال الإمبد!' });
        }
    },

    ticket: {
        data: new SlashCommandBuilder()
            .setName('ticket')
            .setDescription('إنشاء تذكرة دعم جديدة')
            .addStringOption(option =>
                option.setName('سبب')
                    .setDescription('سبب فتح التذكرة')
                    .setRequired(true)),
        async execute(interaction) {
            const reason = interaction.options.getString('سبب');
            await interaction.reply({ content: `تم إنشاء تذكرة جديدة. السبب: ${reason}` });
        }
    },

    invites: {
        data: new SlashCommandBuilder()
            .setName('invites')
            .setDescription('عرض معلومات الدعوات')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('المستخدم المراد عرض معلومات دعواته')
                    .setRequired(false)),
        async execute(interaction) {
            const user = interaction.options.getUser('user') || interaction.user;
            await interaction.reply({ content: `عرض معلومات الدعوات للمستخدم ${user.tag}` });
        }
    },

    clear: {
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
            const amount = interaction.options.getInteger('عدد');
            await interaction.channel.bulkDelete(amount);
            await interaction.reply({ content: `تم حذف ${amount} رسالة`, ephemeral: true });
        }
    },

    stop: {
        data: new SlashCommandBuilder()
            .setName('stop')
            .setDescription('إيقاف البوت'),
        async execute(interaction) {
            await interaction.reply('جاري إيقاف البوت...');
            process.exit(0);
        }
    }
};
