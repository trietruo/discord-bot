const { Op } = require('sequelize');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { Users } = require('./dbObjects.js');

const client = new Client({
  intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
  ],
});
const currency = new Collection();

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

function getBalance(id) {
	const user = currency.get(id);
	return user ? user.balance : 0;
} 

module.exports = { addBalance, getBalance, currency }

client.once(Events.ClientReady, async readyClient => {
	const storedBalances = await Users.findAll();
	storedBalances.forEach(b => currency.set(b.user_id, b));
	
	console.log(`app.js --> Ready!`);
});

client.login(process.env.DISCORD_TOKEN);
