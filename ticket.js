const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create a new ticket'),
    execute: function(interaction) {
        // The existing ticket functionality will be handled by the event listeners
        console.log('Ticket command executed by:', interaction.user.tag);
    },
    init: (client) => {
        const {
            ActionRowBuilder,
            ButtonBuilder,
            ButtonStyle,
            ChannelType,
            PermissionsBitField,
            EmbedBuilder,
            ModalBuilder,
            TextInputBuilder,
            TextInputStyle,
        } = require('discord.js');

        // تحديث معرفات القنوات والفئات
        const ticketTypes = {
            'support': {
                name: 'الدعم الفني',
                categoryId: '1336268494299332741',
                channelId: '1336268626109530133',
                buttonId: 'create_support_ticket',
            },
            'new_ticket': {
                name: 'المتجر',
                categoryId: '1336068759114481685',
                channelId: '1336071384203395245',
                buttonId: 'create_new_ticket',
            },
        };

        client.on('ready', async () => {
            console.log('Ticket system initialized');

            for (const typeId in ticketTypes) {
                const type = ticketTypes[typeId];
                console.log(`Setting up ticket type: ${typeId}`);

                const channel = client.channels.cache.get(type.channelId);
                if (!channel) {
                    console.error(`Channel not found for ticket type: ${typeId}, channelId: ${type.channelId}`);
                    continue;
                }

                const embed = new EmbedBuilder()
                    .setTitle(`${type.name}`)
                    .setColor('#000000')
                    .setImage(
                        'https://media.discordapp.net/attachments/1336312518897041479/1338982734680559687/DALLE_2025-02-12_00.19.12_-_A_mystical_hooded_figure_holding_a_mysterious_glowing_orb_in_a_grand_gothic-style_cathedral._The_atmosphere_is_dark_and_eerie_with_swirling_shadows_.webp?ex=67ad1059&is=67abbed9&hm=93a248496bca92feb637d3bbd737a2f0b3b21368612a2598ddbfc7b05f1744de&=&format=webp&width=991&height=566',
                    );

                if (typeId === 'new_ticket') {
                    embed.setDescription(
                        '***طـبـعـا فـيـه روبـوكـس لـلـبـيـع الأسـعـار زي مـاتـشـوفـون تـحـت قـبـل مـاتـشـوف تـحـت شـيـك عـلـى الـتـعـريـف عـلـشـان تـعـرف زيـن وش ابـيـع***\n\n' +
                        '`-------- 1000 روبوكـس == 40 ريـال  ≈≈ 10 دولار --------`\n\n' +
                        '`-------- 2000 روبـوكـس == 60 ريـال ≈≈ 16 دولار --------`\n\n' +
                        '`-------- 3000 روبـوكـس == 80 ريـال ≈≈ 20 دولار --------`\n\n' +
                        '`-------- 4000 روبـوكـس == 110 ريـال ≈≈ 30 دولار --------`\n\n' +
                        '`-------- 5000  روبـوكـس == 130 ريـال ≈≈ 35 دولار -------`\n\n' +
                        '***نـوع الـطـلـب حـدد كـم الـكـمـيـة الـي تـبـيـهـا طـبـعـا الـكـمـيـات فـقـط مـن الـي فـوق يـعـنـي لاتـجـيـب كـمـيـة غـيـر الـي فـوق***\n\n'
                    );
                } else {
                    embed.setDescription(
                        '***تـنـبـيـه يُـوجـد شـروط لـفـتـح الـتـذكـرة\n\n' +
                        'أول شـيء الـسـبـام فـي الـتـذكـرة يـسـبـب لـك مـيـوت يـوم\n\n' +
                        'ثـانـي شـيء لاتـمـنـشـن احـد مـن الأدارة فـقـط انـتـظـر\n\n' +
                        'الـوقـت الـمـتـواجـد فـيـه 12 الـصـبـح إلـى 12 الـلـيـل***\n\n'
                    );
                }

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(type.buttonId)
                        .setLabel(typeId === 'new_ticket' ? 'متجر' : 'الدعم الفني')
                        .setStyle(ButtonStyle.Secondary)
                );

                try {
                    await channel.send({ embeds: [embed], components: [row] });
                    console.log(`Successfully set up ticket buttons for ${typeId}`);
                } catch (error) {
                    console.error(`Error setting up ticket buttons for ${typeId}:`, error);
                }
            }
        });

        client.on('interactionCreate', async (interaction) => {
            if (interaction.isButton()) {
                console.log('Button interaction received:', interaction.customId);

                for (const typeId in ticketTypes) {
                    const type = ticketTypes[typeId];
                    if (interaction.customId === type.buttonId) {
                        console.log(`Processing ${typeId} ticket button`);

                        if (typeId === 'new_ticket') {
                            const modal = new ModalBuilder()
                                .setCustomId('new_ticket_modal')
                                .setTitle('تذكرة شـراء');

                            const requestTypeInput = new TextInputBuilder()
                                .setCustomId('request_type')
                                .setLabel(':نوع الطلب')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true);

                            const paymentMethodInput = new TextInputBuilder()
                                .setCustomId('payment_method')
                                .setLabel(':طريقة الدفع')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true);

                            const gamepassInput = new TextInputBuilder()
                                .setCustomId('gamepass')
                                .setLabel('هل تعرف تسوي قيم باس؟')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true);

                            const inGameNameInput = new TextInputBuilder()
                                .setCustomId('in_game_name')
                                .setLabel(':اسمك باللعبة')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true);

                            const actionRow1 = new ActionRowBuilder().addComponents(requestTypeInput);
                            const actionRow2 = new ActionRowBuilder().addComponents(paymentMethodInput);
                            const actionRow3 = new ActionRowBuilder().addComponents(gamepassInput);
                            const actionRow4 = new ActionRowBuilder().addComponents(inGameNameInput);

                            modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

                            try {
                                await interaction.showModal(modal);
                                console.log('Modal shown successfully');
                            } catch (error) {
                                console.error('Error showing modal:', error);
                                await interaction.reply({
                                    content: 'حدث خطأ أثناء فتح النموذج. الرجاء المحاولة مرة أخرى.',
                                    ephemeral: true
                                });
                            }
                        } else {
                            const modal = new ModalBuilder()
                                .setCustomId(`ticket_description_modal_${typeId}`)
                                .setTitle('صف مشكلتك/طلبك');

                            const descriptionInput = new TextInputBuilder()
                                .setCustomId('description')
                                .setLabel('الرجاء وصف مشكلتك أو طلبك بالتفصيل:')
                                .setStyle(TextInputStyle.Paragraph)
                                .setRequired(true);

                            const actionRow = new ActionRowBuilder().addComponents(descriptionInput);
                            modal.addComponents(actionRow);

                            try {
                                await interaction.showModal(modal);
                                console.log('General modal shown successfully');
                            } catch (error) {
                                console.error('Error showing general modal:', error);
                                await interaction.reply({
                                    content: 'حدث خطأ أثناء فتح النموذج. الرجاء المحاولة مرة أخرى.',
                                    ephemeral: true
                                });
                            }
                        }
                        return;
                    }
                }
            } else if (interaction.isModalSubmit()) {
                console.log('Modal submit received:', interaction.customId);

                const modalId = interaction.customId;
                if (modalId === 'new_ticket_modal') {
                    console.log('Processing new ticket modal submission');

                    const requestType = interaction.fields.getTextInputValue('request_type');
                    const paymentMethod = interaction.fields.getTextInputValue('payment_method');
                    const gamepass = interaction.fields.getTextInputValue('gamepass');
                    const inGameName = interaction.fields.getTextInputValue('in_game_name');

                    const ticketData = {
                        requestType,
                        paymentMethod,
                        gamepass,
                        inGameName,
                    };

                    try {
                        await createTicket(interaction, ticketData, 'new_ticket');
                        console.log('New ticket created successfully');
                    } catch (error) {
                        console.error('Error creating new ticket:', error);
                        await interaction.reply({
                            content: 'حدث خطأ أثناء إنشاء التذكرة. الرجاء المحاولة مرة أخرى.',
                            ephemeral: true
                        });
                    }
                } else if (modalId.startsWith('ticket_description_modal_')) {
                    console.log('Processing general ticket modal submission');

                    const ticketType = modalId.replace('ticket_description_modal_', '');
                    const description = interaction.fields.getTextInputValue('description');

                    try {
                        await createTicket(interaction, description, ticketType);
                        console.log('General ticket created successfully');
                    } catch (error) {
                        console.error('Error creating general ticket:', error);
                        await interaction.reply({
                            content: 'حدث خطأ أثناء إنشاء التذكرة. الرجاء المحاولة مرة أخرى.',
                            ephemeral: true
                        });
                    }
                }
            }
        });

        async function createTicket(interaction, data, ticketType) {
            console.log(`Creating ticket of type: ${ticketType}`);

            const guild = interaction.guild;
            const type = ticketTypes[ticketType];

            if (!type) {
                console.error(`Invalid ticket type: ${ticketType}`);
                return interaction.reply({
                    content: 'نوع التذكرة غير صالح.',
                    ephemeral: true
                });
            }

            const category = guild.channels.cache.get(type.categoryId);
            if (!category) {
                console.error(`Category not found: ${type.categoryId}`);
                return interaction.reply({
                    content: 'حدث خطأ في العثور على الفئة المناسبة.',
                    ephemeral: true
                });
            }

            try {
                console.log('Creating ticket channel...');
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: interaction.user.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
                            ],
                        },
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: client.user.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ManageChannels,
                                PermissionsBitField.Flags.ReadMessageHistory
                            ],
                        },
                    ],
                });

                console.log('Ticket channel created:', ticketChannel.name);

                const welcomeEmbed = new EmbedBuilder()
                    .setTitle(`مرحبًا بك في تذكرتك، ${interaction.user.username}!`)
                    .setDescription('شكرًا لفتحك تذكرة. سيقوم أحد أعضاء فريق الدعم بالرد عليك في أقرب وقت ممكن.')
                    .setColor('#000000');

                let messageContent;
                if (ticketType === 'new_ticket') {
                    messageContent = `تذكرة جديدة تم إنشاؤها بواسطة ${interaction.user}!\n\n**تفاصيل التذكرة:**\n
                    - **نوع الطلب:** ${data.requestType}
                    - **طريقة الدفع:** ${data.paymentMethod}
                    - **هل تعرف تسوي قيم باس؟:** ${data.gamepass}
                    - **اسمك باللعبة:** ${data.inGameName}`;
                } else {
                    messageContent = `تذكرة جديدة تم إنشاؤها بواسطة ${interaction.user}!\n\n**وصف المشكلة/الطلب:**\n${data}`;
                }

                await ticketChannel.send({ content: messageContent, embeds: [welcomeEmbed] });
                console.log('Welcome message sent to ticket channel');

                await interaction.reply({
                    content: `تم إنشاء تذكرتك! ${ticketChannel}`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error in createTicket:', error);
                await interaction.reply({
                    content: 'حدث خطأ أثناء إنشاء التذكرة. الرجاء المحاولة مرة أخرى.',
                    ephemeral: true
                });
            }
        }
    }
};