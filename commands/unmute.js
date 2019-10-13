module.exports = {
  name: 'mute',
  description: 'Mutes a member',
  usage: '[member] <reason> <time>',
  permissions: ['MANAGE_CHANNELS'],
  args: true,
  async execute (client, message, args) {
    if (!message.mentions.members.first()) return message.reply(`${message.mentions.members.first()} is not a valid member.`);
    const member = message.mentions.members.first();

    member.removeRole('625385600081592321');
    return message.channel.send(`${member.user.tag} has been unmuted.`);
  }
};
