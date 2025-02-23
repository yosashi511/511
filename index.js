require('dotenv').config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
    ],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        client.commands.set(command.data.name, command);
        // تهيئة الأمر إذا كان لديه دالة init
        if (typeof command.init === 'function') {
            command.init(client);
        }
    }
}

// تسجيل الدخول وإعداد الأحداث الأساسية فقط
client.once('ready', () => {
    console.log(`✅ تم تسجيل الدخول بنجاح كـ ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ 
            content: 'حدث خطأ أثناء تنفيذ الأمر!', 
            ephemeral: true 
        });
    }
});

// تسجيل الدخول للبوت
client.login(process.env.DISCORD_TOKEN);

// معالجة إشارات إيقاف التشغيل
process.on('SIGINT', () => {
    console.log('تم استلام إشارة إيقاف التشغيل. جاري إغلاق البوت...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('تم استلام إشارة إنهاء. جاري إغلاق البوت...');
    client.destroy();
    process.exit(0);
});