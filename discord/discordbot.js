const Discord = require('discord.js');
const auth = require('../auth/discordAuth.json');
const fs = require('fs');
const client = new Discord.Client();
let commands = require('./commands.json');

// Event handles
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
  if (!msg.author.bot){
    if (msg.isMemberMentioned(client.user)){
      let array = msg.content.split(' ');
      if (array.length>1){
        let mention = array[0];
        if (mention == `<@${client.user.id}>`){
          handleMessage(msg,array);
        }
      }
    }
  }
});

function handleMessage(msg,array){

}

function getCommands(){
  
}

function saveCommand(cmd){

}

// Exports
(function() {
  module.exports.init = function() {
    client.login(auth.token);
    return client;
  }
}());
