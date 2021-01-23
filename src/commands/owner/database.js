const prettyBytes = require("pretty-bytes");
const fs = require("fs");

module.exports = {
  description: "Set or get database properties.",
  aliases: ["db"],
  subCommands: [
    {
      name: "get",
      description: "Get an instances properties.",
      parameters: [
        {
          name: "model",
          type: String,
          required: true
        },
        {
          name: "instance",
          type: String
        }
      ],
      async execute (client, message, [ modelName, instanceName ]) {
        const embed = new Discord.MessageEmbed({
          color: global.guildInstance.config.colors.default
        });

        const model = global.sequelize.models[modelName];
        if (!model) return message.channel.send(`Model \`${modelName}\` does not exist.`);

        // If no entity provided, show all entities
        if (!instanceName) {
          const entities = await model.findAll({ include: { all: true, nested: true } });
          const array = entities.map(entity => Object.values(entity.dataValues)[0]);

          embed.setTitle(`${modelName}`);
          embed.setDescription(`\`\`\`json\n${JSON.stringify(array, null, 2)}\`\`\``);

          return message.channel.send(embed);
        }

        // Check if object exists
        const object = await model.findByPk(instanceName, { include: { all: true, nested: true } });
        if (object === null) return message.channel.send(`Object: ${instanceName}, does not exist.`);

        // Set embed properties
        embed.setTitle(`${modelName}: ${instanceName}`);
        embed.setDescription(`\`\`\`json\n${JSON.stringify(object, null, 2)}\`\`\``);

        return message.channel.send(embed);
      }
    },
    {
      name: "set",
      description: "Set an instance property.",
      parameters: [
        {
          name: "model",
          type: String,
          required: true
        },
        {
          name: "instance",
          required: true
        },
        {
          name: "property",
          type: String,
          required: true
        },
        {
          name: "value"
        }
      ],
      async execute (client, message, [ modelName, instanceName, propertyName, value ]) {
        // Check if model exists
        const model = global.sequelize.models[modelName];
        if (!model) return message.channel.send(`Model \`${modelName}\` does not exist.`);

        // Check if object exists
        const object = await model.findByPk(instanceName);
        if (object === null) return message.channel.send(`Object \`${instanceName}\` does not exist.`);

        // Check if property exists
        if (!object[propertyName]) return message.channel.send(`Property \`${propertyName}\` does not exist.`);

        await object.update({ [propertyName]: JSON.parse(value) });

        return message.channel.send(`Set ${modelName}: ${instanceName}.${propertyName} to \`${value}\`.`);
      }
    },
    {
      name: "info",
      description: "Shows information about the database.",
      async execute (client, message) {
        const { colors } = await global.sequelize.models.guildConfig.findByPk(message.guild.id);

        const { dependencies } = require(`${__basedir}/../package.json`);

        const sequelizeVersion = dependencies.sequelize;
        const sqlite3Version = dependencies.sqlite3;

        const stats = fs.statSync(`${__basedir}/database.sqlite`);
        const size = prettyBytes(stats.size);

        // Create embed
        const embed = new Discord.MessageEmbed({
          color: colors.default,
          title: "Database Information",
          fields: [
            { name: "Sequelize Version:", value: sequelizeVersion, inline: true },
            { name: "Sqlite3 Version:", value: sqlite3Version, inline: true },
            { name: "Database Size:", value: size },
          ]
        });

        return message.channel.send(embed);
      }
    }
  ]
};