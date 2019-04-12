const TwitchWebhook = require('twitch-webhook');
const Discord = require('../discord/discordbot.js');
const webhookinfo = require('./webhookinfo.json');
const twitchWebhook = new TwitchWebhook(webhookinfo);

twitchWebhook.subscribe('streams', {
  user_id: 50766545
})

twitchWebhook.on('streams', ({ event }) => {
  Discord.liveNotification(event,false);
})

twitchWebhook.on('unsubscibe', (obj) => {
  twitchWebhook.subscribe(obj['hub.topic'])
})