const { SlashCommandBuilder } = require('discord.js');
const { currency } = require('../../app.js');

function getBalance(id) {
    const user = currency.get(id);
    return user ? user.balance : 0;
} 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Checks your balance.'),
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        return interaction.reply(`<@${interaction.user.id}> has 💸 ${getBalance(target.id)} POKASH.`);
    }
};
