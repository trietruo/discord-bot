const { SlashCommandBuilder } = require('discord.js');
const { animals, enhypen, foods, fashion } = require('./headsup.json');
const { currency } = require('../../app.js');
const { Users } = require('../../dbObjects.js');

const theme = animals;
const timeLimit = 45;

async function addBalance(id, amount) {
    const user = currency.get(id);

    if (user) {
        user.balance += Number(amount);
        return user.save();
    }

    const newUser = await Users.create({ user_id: id, balance: amount });
    currency.set(id, newUser);

    return newUser;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('headsup')
        .setDescription('Initiates a game of Heads Up!'),
    async execute(interaction) {
        // Sets up the message to select the guesser
        const message = await interaction.reply({ content: `<@${interaction.user.id}>, react to initiate the game.`, fetchReply: true });
        await message.react('🐱');

        // Awaiting for reactions (creating a filter)
        const collectorFilter = (reaction, user) => {
            return ['🐱'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        };

        message.awaitReactions({ filter: collectorFilter, max: 1, time: 10000, errors: ['time'] })
            .then(collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '🐱') {
                    // Determining the word from the deck
                    index = Math.floor(Math.random() * theme.length);
                    currentWord = theme[index];
                    modifiedWord = currentWord + "                              ";
                    modifiedWord = modifiedWord.substring(0, 30);
                    modifiedWord = '# ||\`' + modifiedWord + `\`||`;
                    message.reply(`<@${interaction.user.id}>, you're the guesser; don't open the card below! Your time starts now.\n${modifiedWord}`);

                    // Setting up the collector to validate the correct message
                    const wordFilter = m => m.author.id == interaction.user.id && m.content.toLowerCase().includes(currentWord);
                    const collector = interaction.channel.createMessageCollector({ filter: wordFilter, time: timeLimit * 1000, max: 1 });

                    collector.on('collect', m => {
                        message.reply(`Nice, <@${interaction.user.id}>! You got the word. I've given you 💸 1 POKASH!`);
                        addBalance(interaction.user.id, 1);
                    });

                    collector.on('end', m => {
                        if (collector.endReason == 'time') {
                            message.reply(timeLimit + ` seconds are up, <@${interaction.user.id}>. You failed! The word was **` + currentWord + `**.`);
                        }
                    });
                }
            })
            .catch(collected => {
                message.reply('The game did not start because a guesser was not selected.');
            });
    },
};
