module.exports = async (client, member) => {
  const channel = member.guild.channels.find(channel => channel.name.includes('member-log'));
  const embed = new client.discord.RichEmbed()
    .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL)
    .setFooter('User left')
    .setColor('#1ED760')
    .setTimestamp();

  channel.send(embed);

  console.log(`${member.user.tag} has left the server.`);

  (await client.models.members.findByPk(member.id)).destroy();
};
