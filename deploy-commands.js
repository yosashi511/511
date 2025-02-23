const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    {
        name: 'embed',
        description: 'يُرسل إمبد مع معلومات مخصصة',
    },
    {
        name: 'ping',
        description: 'يرد عليك بـ Pong!',
    },
    {
        name: 'stop',
        description: 'إيقاف البوت',
    },
    {
        name: 'ticket',
        description: 'إنشاء تذكرة دعم جديدة',
        options: [
            {
                name: 'سبب',
                description: 'سبب فتح التذكرة',
                type: 3, // STRING
                required: true,
            }
        ]
    },
    {
        name: 'invites',
        description: 'عرض معلومات الدعوات',
        options: [
            {
                name: 'user',
                description: 'المستخدم المراد عرض معلومات دعواته',
                type: 6, // USER
                required: false,
            }
        ]
    },
    {
        name: 'حذف',
        description: 'حذف عدد محدد من الرسائل من الروم',
        options: [
            {
                name: 'عدد',
                description: 'عدد الرسائل المراد حذفها',
                type: 4, // INTEGER
                required: true,
                min_value: 1,
                max_value: 1000
            }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🚨 جاري تحديث الأوامر...');

        // حذف الأوامر القديمة
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] });
        console.log('✅ تم مسح الأوامر القديمة بنجاح.');

        // رفع الأوامر الجديدة
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log('✅ تم رفع الأوامر الجديدة بنجاح.');

    } catch (error) {
        console.error('❌ خطأ أثناء تحديث الأوامر:', error);
    }
})();