module.exports = {
  name: 'guess',
  description: 'Guess a number.',
  usage: '[number]',
  cooldown: '120',
  args: true,
  async execute (client, message, args) {
    const user = await client.models.members.findByPk(message.author.id);
    const input = Math.floor(args[0]);

    const value = Math.round(Math.random() * 100);
    const earn = value !== input ? Math.round(50 / Math.abs(value - input) * 4) : 1000;

    await user.update({ balance: user.balance + earn });

    return message.reply(`The number was ${value}, you earned ${client.config.currency}${earn}.`);
  }
};
