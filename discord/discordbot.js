const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const auth = require('../auth/discordAuth.json');
const fs = require('fs');
const client = new Discord.Client();
let commands = require('./commands.json');

let playing = false;

// Event handles
client.on('ready', () => {
  console.log(`Discord logged in as ${client.user.tag}!`);
});

client.on('disconnect', () => {
  client.login(auth.token);
})

client.on('error', (error) => {
  console.log(error);
})

client.on('message', (msg) => {
  if (!msg.author.bot){
    if (msg.isMemberMentioned(client.user)){
      let array = msg.content.split(' ');
      if (array.length>1){
        let mention = array[0];
        if (mention == `<@${client.user.id}>`){
          handleMessage(msg,array.splice(1));
        }
      }
    }
  }
});

function handleMessage(msg,array){
  let cmd = array[0];
  let args = array.splice(1);
  
  switch(cmd){
    case 'play': {
      if (msg.member.voiceChannel) {
        if (args.length>0){
          if (!playing){
            msg.member.voiceChannel.join()
              .then(connection => {
                playMusic(connection,args[0]);
              })
              .catch(msg.reply('Error when connecting to voice!'));
          } else {
            if (client.voiceConnections.size > 0){
              playmusic(client.voiceConnections.get(msg.guild),args[0]);
            }
          }
        } else {
          msg.reply('You need to specify a youtube url!');
        }
      } else {
        msg.reply('You need to join a voice channel first!');
      }
      break;
    }
    case 'stop':{
      if (client.voiceConnections.has(msg.guild.id)){
        playing = false;
        client.voiceConnections.get(msg.guild.id).disconnect();
      }
      break;
    }
    case 'test':{
      if (args[0]=='live'){
        liveNotification({data:[{type:'live',channel:msg.channel}]},true);
      } else if (args[0]=='offline'){
        liveNotification({data:[],channel:msg.channel},true);
      }
      break;
    }
    default:{
      break;
    }
  }
}

function playMusic(connection,url){
  let split = url.split("?t=");
  if (split.length>1){
    stream = ytdl(split[0],{filter:'audioonly',bitrate:132000});
    dispatcher = connection.playStream(stream,{bitrate:132000,volume:0.2,seek:split[1]});
  }
  dispatcher.on('end', () => {
    playing = false;
    connection.disconnect();
  });
  dispatcher.on('error', () => {
    playing = false;
    connection.disconnect();
  });
}

function playFromTwitch(url){
  let channel = client.guilds.get('380068349255745536').channels.get('380068350145069070');
  channel.join()
  .then(connection => {
    playMusic(connection,url);
  });
}

function saveCommand(cmd,response){
  commands[cmd] = response;
  fs.writeFileSync('./commands.json', JSON.stringify(commands));
}

function liveNotification(event,test){
  if (event.data[0]!=undefined){
    if (event.data[0].type=='live'){
      let channel = client.guilds.get('380068349255745536').channels.get('383157339986853891');
      //let channel = client.guilds.get('551361062100795394').channels.get('551361062100795397');
      let stamp = new Date().toISOString();
      if (test){channel=event.data[0].channel}
      let embed = new Discord.RichEmbed({
        description: `**The stream just went live!**\n${event.data[0].title}\nhttps://twitch.tv/miva\n<@&420668800514523162>`,
        thumbnail: {
          url:'https://static-cdn.jtvnw.net/jtv_user_pictures/a78b7e5a-aae5-494d-80bf-6a01b6bbbf8e-profile_image-70x70.png'
        },
        color: 32000,
        timestamp: stamp
      });
      channel.send(embed);
    }
  } else {
    let stamp = new Date().toISOString();
    let channel = client.guilds.get('380068349255745536').channels.get('383157339986853891');
    //let channel = client.guilds.get('551361062100795394').channels.get('551361062100795397');
    if (test){channel=event.channel};
    let embed = new Discord.RichEmbed({
      description: `**Stream is now offline**\nThanks for watching!`,
      thumbnail: {
        url:'https://static-cdn.jtvnw.net/jtv_user_pictures/a78b7e5a-aae5-494d-80bf-6a01b6bbbf8e-profile_image-70x70.png'
      },
      color: 16711680,
      timestamp: stamp
    });
    channel.send(embed);
  }
}

// Exports
(function() {
  module.exports.init = () => {
    client.login(auth.token);
  }
  module.exports.liveNotification = (event,test) => {
    liveNotification(event,test);
  };
  module.exports.playFromTwitch = (url) => {
    playFromTwitch(url);
  }
}());
