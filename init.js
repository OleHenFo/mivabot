const Discordbot = require('./discord/discordbot.js');
const Twitchbot = require('./twitch/twitchbot.js');
const Webhook = require('./webhook/webhook.js');
const Misc = require('./misc/misc.js');

Discordbot.init();
Twitchbot.init();