require("dotenv/config");
const tmi = require("tmi.js");
const axios = require("axios");

const oauth_token = process.env.OAUTH_TOKEN;

gecko_url = "https://api.coingecko.com/api/v3";
draco_url = "https://api.mir4global.com/wallet/prices/draco/lastest";

const get_wemix_price = async () => {
  try {
    let wemix_price = await axios.get(
      `${gecko_url}/simple/price?ids=wemix-token&vs_currencies=usd`
    );
    return wemix_price.data["wemix-token"].usd;
  } catch (err) {
    return null;
  }
};

const get_draco_data = async () => {
  try {
    const res = await axios.post(draco_url);
    const { DracoPrice, USDDracoRate } = res.data.Data;
    return {
      DracoPrice,
      USDDracoRate,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
};

const create_client = async () => {
  const opts = {
    port: process.env.PORT || 80,
    connection: {
      reconnect: true,
    },
    maxReconnectInterval: 1000,
    identity: {
      username: process.env.BOT_NAME,
      password: oauth_token,
    },

    channels: process.env.CHANNEL_LIST.split(","),
  };

  return (client = new tmi.client(opts));
};

// try {
//   const client = await create_client();
// } catch (err) {
//   console.log(err);
// }

async function onMessageHandler(target, context, msg, self) {
  try {
    if (self) {
      return;
    } // Ignore messages from the bot

    // Remove whitespace from chat message
    const commandName = msg.trim();

    // If the command is known, let's execute it
    if (commandName === "!draco") {
      const { DracoPrice, USDDracoRate } = await get_draco_data();
      const wemix_usd = await get_wemix_price();
      console.log(msg)
      client.say(
        target,
        `1 Draco está valendo ${Number(DracoPrice).toFixed(4)} Wemix / 
        1 Wemix está valendo ${wemix_usd} USD / 
        1 Draco está valendo ${Number(USDDracoRate).toFixed(4)} USD`
      );
    } else if (commandName.split(" ")[0] === '!draco' && Number(commandName.split(" ")[1])){
      const { DracoPrice, USDDracoRate } = await get_draco_data();
      const wemix_usd = await get_wemix_price();
      console.log(msg)
      client.say(
        target,
        `1 Draco está valendo ${Number(DracoPrice).toFixed(4)} Wemix / 
        1 Wemix está valendo ${wemix_usd} USD / 
        1 Draco está valendo ${Number(USDDracoRate).toFixed(4)} USD/
        Você tem ${Number(commandName.split(" ")[1])} Dracos e ${(Number(commandName.split(" ")[1])*USDDracoRate).toFixed(2)} em USD!
        `
      );
    } else {

    }
  } catch (err) {
    client.close()
    init()
  }
}

function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

async function init() {
  
  // Connect to Twitch:
  try {
    // event handler
    const client = await create_client();
    await client.connect();
    client.on("connected", onConnectedHandler);
    client.on("message", onMessageHandler);
  } catch (err) {
    console.log(`${err}`);
  }
}

init();
