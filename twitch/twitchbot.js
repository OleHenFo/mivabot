const fs = require('fs');
const tmi = require('tmi.js');
const identity = require('../auth/twitchidentity.json');
const opts = {identity,channels:['miva']}
const twitch = new tmi.client(opts);
let commands = require('../twitch/commands.json');

let timeout = Date.now();

function onMessageHandler (channel, user, msg, self) {
  if (self) { return; }
  switch(user['message-type']) {
  case 'action':
    handleAction(channel, user, msg);
    break;
  case 'chat':
    handleChat(channel, user, msg);
    break;
  case 'whisper':
    handleWhisper(channel, user, msg);
    break;
  default:
    break;
  }
}

function handleChat(channel, user, msg){
  if (msg.startsWith('!')){
    const stringArray = msg.trim().split(' ');
    const command = stringArray[0].substring(1);
    const username = user.username;
    let response = `@${username} ${command} is not a command!`;

    if (commands.hasOwnProperty(command)){
      response = eval('`'+commands[command]+'`');
    } else {
      switch(command) {
        case 'help':
          response =  `@${username} Commands: !add, !${Object.keys(commands).join(', !')}`;
          break;
        case 'so':
          if (user.mod||user.badges.broadcaster == 1){
            if (stringArray.length>1){
              let shoutout = stringArray[1];
              response = `@${shoutout} https://www.twitch.tv/${shoutout} <3`;
            } else {
              response = `@${username} Missing arguments!`;
            }
          } else {
            response = `@${username} Only mods can give shoutouts!`;
          }
          break;
        case 'add':
          if (user.mod||user.badges.broadcaster == 1){
            if (stringArray.length>2){
              let newCommand = stringArray[1];
              let newResponse = stringArray.slice(2,stringArray.length).join(" ");
              
              if (!commands.hasOwnProperty(newCommand)){
                commands[newCommand] = newResponse;
                fs.writeFileSync('./commands.json', JSON.stringify(commands));
                response = `@${username} Added new command: !${newCommand}`;
              } else {
                response = `@${username} That command already exists!`;
              }
            } else {
              response = `@${username} Missing arguments!`;
            }
          } else {
            response = `@${username} Only mods can add commands!`;
          }
          break;
        case 'remove':
          if (user.mod||user.badges.broadcaster == 1){
            if (stringArray.length>1){
              let toRemove = stringArray[1];
              
              if (commands.hasOwnProperty(toRemove)){
                delete commands[toRemove];
                fs.writeFileSync('./commands.json', JSON.stringify(commands));
                response = `@${username} removed command: !${toRemove}`;
              } else {
                response = `@${username} That command doesn't exists!`;
              }
            } else {
              response = `@${username} Missing arguments!`;
            }
          } else {
            response = `@${username} Only mods can remove commands!`;
          }
          break;
        default:
          break;
      }
    }
    if (response!=``&&user['message-type']=='whisper'){
      twitch.whisper(channel,response.replace(/@\S*/g,''));
    } else {
      twitch.say(channel,response);
    }
  } else if (((Date.now()-timeout))>8000){
    if (msg.includes('Kappa')){
      twitch.say(channel,'Kappa');
      timeout = Date.now();
    } else if (msg.includes('<3')){
      twitch.say(channel,'<3 <3 <3');
      timeout = Date.now();
    } else if (msg.includes('LUL')){
      twitch.say(channel,'LUL');
      timeout = Date.now();
    }
  }
}

function handleWhisper(channel, user, msg){
  handleChat(channel,user,msg);
}

function handleAction(channel, user, msg){
}

function onConnectedHandler (addr, port) {
  console.log(`Twitch connected to ${addr}:${port}`);
}

twitch.on('message', onMessageHandler);
twitch.on('connected', onConnectedHandler);

// Exports
(function() {
  module.exports.init = () => {
    twitch.connect();
    return twitch;
  }
}());
