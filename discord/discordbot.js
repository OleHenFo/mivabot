const Discord = require('discord.js');
const auth = require('../auth/discordAuth.json');
const client = new Discord.Client();

// Event handles
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
  console.log(msg.mentions.users);
});

// Exports
(function() {
  module.exports.init = function() {
    client.login(discordAuth.token);
    return client;
  }
}());
