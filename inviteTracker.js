const { SlashCommandBuilder, Collection, EmbedBuilder } = require('discord.js');

// متغير لتخزين الدعوات
const invites = new Collection();

// متغير لتتبع آخر دعوة مستخدمة لكل عضو
const lastUsedInvites = new Collection();

// متغير لتتبع آخر حدث تم معالجته مع التوقيت
const processedEvents = new Collection();

// تنظيف الأحداث القديمة بشكل دوري
setInterval(() => {
    const now = Date.now();
    const oldEvents = Array.from(processedEvents.entries())
        .filter(([_, timestamp]) => now - timestamp > 10000);
    oldEvents.forEach(([key]) => processedEvents.delete(key));
}, 30000); // تنظيف كل 30 ثانية

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('عرض معلومات الدعوات')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('المستخدم المراد عرض معلومات دعواته')
                .setRequired(false)),

    init: async (client) => {
        // تحميل الدعوات عند بدء تشغيل البوت
        client.guilds.cache.forEach(async (guild) => {
            try {
                const guildInvites = await guild.invites.fetch();
                invites.set(guild.id, new Collection(guildInvites.map((invite) => [invite.code, {
                    uses: invite.uses,
                    inviter: invite.inviter?.id,
                    code: invite.code
                }])));
                console.log(`✅ تم تحميل ${guildInvites.size} دعوة من السيرفر ${guild.name}`);
            } catch (error) {
                console.error(`❌ خطأ في تحميل دعوات السيرفر ${guild.name}:`, error);
            }
        });

        // مراقبة دخول الأعضاء الجدد
        client.on('guildMemberAdd', async (member) => {
            try {
                const now = Date.now();
                const eventId = `join_${member.id}_${now}`;

                // التحقق من وجود حدث مماثل خلال آخر 10 ثواني
                const recentEvent = Array.from(processedEvents.entries())
                    .find(([key, timestamp]) =>
                        key.startsWith(`join_${member.id}`) &&
                        now - timestamp < 10000
                    );

                if (recentEvent) {
                    console.log(`تجاهل حدث دخول مكرر للعضو ${member.user.tag}`);
                    return;
                }

                processedEvents.set(eventId, now);

                const logChannel = member.guild.channels.cache.get('1337469539373416489');
                if (!logChannel) return;

                // جلب الدعوات الحالية
                const newInvites = await member.guild.invites.fetch();
                const oldInvites = invites.get(member.guild.id) || new Collection();

                let usedInvite = null;
                let inviter = null;
                let inviterTotalInvites = 0;

                for (const [code, newInvite] of newInvites) {
                    const oldInvite = oldInvites.get(code);
                    if (oldInvite && newInvite.uses > oldInvite.uses) {
                        usedInvite = newInvite;
                        try {
                            inviter = await member.guild.members.fetch(usedInvite.inviter.id);
                            inviterTotalInvites = newInvites
                                .filter(inv => inv.inviter?.id === inviter.id)
                                .reduce((total, inv) => total + inv.uses, 0);

                            // حفظ معلومات الدعوة للعضو
                            lastUsedInvites.set(member.id, {
                                inviterId: inviter.id,
                                code: usedInvite.code,
                                timestamp: now
                            });
                            break;
                        } catch (error) {
                            console.error('❌ خطأ في جلب معلومات الداعي:', error);
                        }
                    }
                }

                // تحديث مجموعة الدعوات
                invites.set(member.guild.id, new Collection(newInvites.map(invite => [invite.code, {
                    uses: invite.uses,
                    inviter: invite.inviter?.id,
                    code: invite.code
                }])));

                const embed = new EmbedBuilder()
                    .setTitle('👋 عضو جديد انضم للسيرفر')
                    .setDescription([
                        `> 👤 **العضو:** ${member.user}`,
                        `> 📅 **تاريخ إنشاء الحساب:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                        `> 🔢 **رقم العضو:** ${member.guild.memberCount}`,
                        '',
                        '**معلومات الدعوة:**',
                        `> 🎯 **الداعي:** ${inviter ? inviter.user : 'غير معروف'}`,
                        `> 🔗 **رابط الدعوة:** discord.gg/${usedInvite?.code || 'غير معروف'}`,
                        `> 📊 **استخدامات الرابط:** ${usedInvite?.uses || '0'}`,
                        `> 🌟 **إجمالي دعوات العضو:** ${inviterTotalInvites}`,
                    ].join('\n'))
                    .setColor('#000000')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
                console.log(`✅ تم تسجيل دخول عضو جديد: ${member.user.tag}`);

            } catch (error) {
                console.error('❌ خطأ في معالجة دخول عضو جديد:', error);
            }
        });

        // مراقبة خروج الأعضاء
        client.on('guildMemberRemove', async (member) => {
            try {
                const now = Date.now();
                const eventId = `leave_${member.id}_${now}`;

                // التحقق من وجود حدث مماثل خلال آخر 10 ثواني
                const recentEvent = Array.from(processedEvents.entries())
                    .find(([key, timestamp]) =>
                        key.startsWith(`leave_${member.id}`) &&
                        now - timestamp < 10000
                    );

                if (recentEvent) {
                    console.log(`تجاهل حدث خروج مكرر للعضو ${member.user.tag}`);
                    return;
                }

                processedEvents.set(eventId, now);

                const logChannel = member.guild.channels.cache.get('1337469539373416489');
                if (!logChannel) return;

                // جلب معلومات الدعوة والداعي
                const inviteInfo = lastUsedInvites.get(member.id);
                let inviter = null;
                let inviterCurrentInvites = 0;

                if (inviteInfo && Date.now() - inviteInfo.timestamp < 30 * 24 * 60 * 60 * 1000) { // 30 days
                    try {
                        inviter = await member.guild.members.fetch(inviteInfo.inviterId);
                        const guildInvites = await member.guild.invites.fetch();
                        inviterCurrentInvites = guildInvites
                            .filter(inv => inv.inviter?.id === inviter.id)
                            .reduce((total, inv) => total + inv.uses, 0);
                    } catch (error) {
                        console.error('❌ خطأ في جلب معلومات الداعي عند الخروج:', error);
                    }
                }

                const embed = new EmbedBuilder()
                    .setTitle('👋 عضو غادر السيرفر')
                    .setDescription([
                        `> 👤 **العضو:** ${member.user}`,
                        `> ⏰ **مدة البقاء:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                        `> 🔢 **عدد الأعضاء الحالي:** ${member.guild.memberCount}`,
                        '',
                        '**معلومات إضافية:**',
                        `> 📅 **تاريخ الانضمام:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                        inviter ? [
                            `> 🎯 **تم دعوته بواسطة:** ${inviter.user}`,
                            `> 📊 **عدد دعوات الداعي الحالي:** ${inviterCurrentInvites}`,
                            `> 🔗 **رابط الدعوة المستخدم:** discord.gg/${inviteInfo.code}`
                        ].join('\n') : '> ❓ **معلومات الداعي غير متوفرة**'
                    ].join('\n'))
                    .setColor('#000000')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] });
                console.log(`👋 تم تسجيل خروج عضو: ${member.user.tag}`);

            } catch (error) {
                console.error('❌ خطأ في معالجة خروج عضو:', error);
            }
        });

        // مراقبة إنشاء دعوات جديدة
        client.on('inviteCreate', async (invite) => {
            try {
                const guildInvites = invites.get(invite.guild.id) || new Collection();
                guildInvites.set(invite.code, {
                    uses: invite.uses,
                    inviter: invite.inviter?.id,
                    code: invite.code
                });
                invites.set(invite.guild.id, guildInvites);
                console.log(`✨ تم إنشاء دعوة جديدة: ${invite.code}`);
            } catch (error) {
                console.error('❌ خطأ في معالجة إنشاء الدعوة:', error);
            }
        });

        // مراقبة حذف الدعوات
        client.on('inviteDelete', (invite) => {
            try {
                const guildInvites = invites.get(invite.guild.id);
                if (guildInvites) {
                    guildInvites.delete(invite.code);
                    console.log(`🗑️ تم حذف الدعوة: ${invite.code}`);
                }
            } catch (error) {
                console.error('❌ خطأ في معالجة حذف الدعوة:', error);
            }
        });
    },

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const member = await interaction.guild.members.fetch(targetUser.id);

            // جلب دعوات السيرفر
            const guildInvites = await interaction.guild.invites.fetch();

            // فلترة دعوات العضو
            const userInvites = guildInvites.filter(invite => invite.inviter?.id === targetUser.id);

            // حساب الإحصائيات
            const totalInvites = userInvites.reduce((total, invite) => total + invite.uses, 0);
            const activeInvites = userInvites.filter(invite => !invite.maxUses || invite.uses < invite.maxUses);

            // تجهيز تفاصيل الدعوات النشطة
            const inviteDetails = activeInvites.map(invite =>
                `\`${invite.code}\` | الاستخدامات: **${invite.uses}**${invite.maxUses ? ` / ${invite.maxUses}` : ''}`
            ).join('\n') || 'لا توجد دعوات نشطة';

            const embed = new EmbedBuilder()
                .setTitle(`📊 إحصائيات الدعوات | ${targetUser.tag}`)
                .setDescription([
                    `👤 **المستخدم:** ${targetUser}`,
                    `📈 **إجمالي الدعوات:** ${totalInvites}`,
                    `🔗 **عدد الروابط النشطة:** ${activeInvites.size}`,
                    '\n**تفاصيل الروابط النشطة:**',
                    inviteDetails
                ].join('\n'))
                .setColor('#000000')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            console.log(`✅ تم عرض إحصائيات الدعوات لـ ${targetUser.tag}`);
        } catch (error) {
            console.error('❌ خطأ في تنفيذ أمر الدعوات:', error);
            await interaction.reply({
                content: 'حدث خطأ أثناء جلب إحصائيات الدعوات. الرجاء المحاولة مرة أخرى.',
                ephemeral: true
            });
        }
    }
};