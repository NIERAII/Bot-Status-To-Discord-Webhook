const { EmbedBuilder, WebhookClient } = require('discord.js');
const http = require('http');
const https = require('https');
const exitHook = require('async-exit-hook');

// Webhooks set up, you can safely delete unnecessary ones or add more
const webhooks = {
  test: new WebhookClient({ url: '' }),
  example: new WebhookClient({ url: '' }),
  sample: new WebhookClient({ url: '' }), 
};

// Mostly placeholder except for color
const embedSuccess = new EmbedBuilder()
    .setTitle(`Status:`)
    .setDescription(`Currently Online \`🟢\``)
    .setColor("#f7dbea")
    .setThumbnail("https://cdn.discordapp.com/icons/576546068083376148/e93239f819e6c0023f0b96658edd0836.png?size=4096");
const embedFail = new EmbedBuilder()
    .setTitle(`Status:`)
    .setDescription('Went Offline \`🔴\`')
    .setColor("#3d3739")
    .setThumbnail("https://cdn.discordapp.com/icons/576546068083376148/e93239f819e6c0023f0b96658edd0836.png?size=4096");

let bots 

debug = false 
stateInterval = 60000 * 3 // interval between ping requests, in this case 3 minutes

if (debug == true) {
  bots = {
    SS: {
      name: "Shapeshifter", // Bot name
      pfp: "", // [Optional] Picture that will be used in embed (Should be a direct link)
      pingUrl: "http://localhost:0839/ping", // URL for pinging the bot (Or any other service)
      webHooks: ["test", "example", "sample"], // Webhooks that will be executed for status updates
      deletePrevious: ["test"], // [Optional] Which webhooks will delete previous message [Status updates and proccess exit]
      onOffline: { 
        test: "This is a test",
        sample: "And this is too"
      }, // [Optional] When bot is offline, sends message aside from embed, you can use this to ping someone
      lastState: "None", // Recommended to keep this unchanged
      messageIds: {} // And this
    }
  }
}
else {
bots = {
  yourBot: {
    name: "",
    pfp: "",
    pingUrl: "",
    webHooks: [""],
    deletePrevious: [""],
    onOffline: {},
    lastState: "None",
    messageIds: {}
  },
  randomBot: {
    name: "",
    pfp: "",
    pingUrl: "",
    webHooks: [""],
    deletePrevious: [""],
    onOffline: {},
    lastState: "None",
    messageIds: {}
  },
};
}

function pingUrl(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https://') ? https : http;
  
      protocol.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          reject(new Error(`Request failed with status code: ${res.statusCode}`));
        }
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

async function main(bot) {
  const urlPing = bot.pingUrl;
  try {
    await pingUrl(urlPing);
    const currentState = "Success";
    if (bot.lastState !== currentState) {
        bot.lastState = currentState;
        embedSuccess.setTitle(`${bot.name}:`);
        embedSuccess.setDescription(`Currently Online \`🟢\` ⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁬⁯ ⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ \nSince last change: <t:${Math.floor(Number(Date.now()) / 1000)}:R>`)
        embedSuccess.setThumbnail(bot?.pfp)
        console.log(`${bot.name} online`);
        bot.webHooks.forEach((webHook) => {
          if (bot?.deletePrevious.includes(webHook)) {
            webhooks[webHook]?.deleteMessage(bot?.messageIds[webHook]).catch(() => {});
          }
          webhooks[webHook]?.send({
            embeds: [embedSuccess]
          }).catch(() => {}).then(hook => {bot.messageIds[webHook] = hook.id});
        });
    }
  } catch (error) {
    const currentState = "Fail";
    if (bot.lastState !== currentState) {
        bot.lastState = currentState;
        embedFail.setTitle(`${bot.name}:`);
        embedFail.setDescription(`Went Offline \`🔴\` ⁯ ⁬⁯ ⁯ ⁬⁯⁬⁯ ⁬⁯  ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ ⁬⁯ \nSince last change: <t:${Math.floor(Number(Date.now()) / 1000)}:R>`)
        embedFail.setThumbnail(bot?.pfp)
        console.log(`${bot.name} offline ` + error);
        bot.webHooks.forEach((webHook) => {
          if (bot?.deletePrevious.includes(webHook)) {
            webhooks[webHook]?.deleteMessage(bot?.messageIds[webHook]).catch(() => {});
          }
          webhooks[webHook]?.send({
            content: `${ bot.onOffline[webHook] ? `${bot.onOffline[webHook]}` : " "}`,
            embeds: [embedFail]
          }).catch(() => {}).then(hook => {bot.messageIds[webHook] = hook.id});
        });
    }
  }
}

async function deleteAll(bot) {
  try {
        bot.webHooks.forEach((webHook) => {
          if (bot?.deletePrevious.includes(webHook)) {
          webhooks[webHook]?.deleteMessage(bot?.messageIds[webHook]).catch(() => {});
          }
        });
  } catch (error) {
    console.log(error)
  }
}

const interval = setInterval(() => {
    Object.values(bots).forEach(main);
}, stateInterval);

function stopPinging() {
  clearInterval(interval);
  console.log("Stopped pinging URLs.");
} 

// Deltes messages before exit, 
// ! On windows process.kill(signal) immediately kills the process, and does not fire signal events,
// ! and as such, cannot be used to gracefully exit.
exitHook(callback => {
  stopPinging();
  Object.values(bots).forEach(deleteAll);
  setTimeout(() => {
      console.log('Exited');
      callback();
  }, 5000);
});

Object.values(bots).forEach(main); // Initial ping
