 
const WebSocket = require('ws');

// var ATR = require('technicalindicators').ATR
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config()
const TOKEN=process.env.TOKEN
// console.log(TOKEN)
// return
const bot=new TelegramBot(TOKEN,{polling:true})



// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
// const bot = new TelegramBot('6526656429:AAEE2CXHPh9t_nZApTJ8hwMRkFR1iWL7qO8', { polling: true });
const symbols = new Set(['BTCUSDT', 'ICPUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 
'TRXUSDT', 'LINKUSDT', 'MATICUSDT', 'BCHUSDT', 'LTCUSDT', 'NEARUSDT', 'FILUSDT', 'ATOMUSDT', 'APTUSDT', 'OPUSDT', 
'STXUSDT', 'HBARUSDT', 'XLMUSDT', 'VETUSDT', 'FETUSDT', 'GALAUSDT', 'FTMUSDT', 'ALGOUSDT', 'FLOWUSDT', 
'EGLDUSDT', 'QNTUSDT', 'AGIXUSDT', 'MINAUSDT', 'MANAUSDT', 'APEUSDT', 'CHZUSDT', 'XECUSDT', 'CFXUSDT', 'ROSEUSDT', 
'JASMYUSDT', 'IOTAUSDT', 'LPTUSDT', 'GMTUSDT', 'TWTUSDT', 'GLMUSDT', 'ZILUSDT', 'CELOUSDT', 'SCUSDT', 'QTUMUSDT', 'SKLUSDT', 
'ZECUSDT', 'MASKUSDT', 'XEMUSDT', 'DASHUSDT', 'WAVESUSDT', 'PONDUSDT', 'TRBUSDT', 'STRAXUSDT', 'MOVRUSDT', 'SCRTUSDT', 'CELRUSDT',
 'PHBUSDT', 'DUSKUSDT', 'CTXCUSDT', 'OMGUSDT', 'ACHUSDT', 'ONGUSDT', 'BLZUSDT', 'LOOMUSDT', 'AGLDUSDT', 'PHAUSDT', 'NKNUSDT',
  'STMXUSDT', 'STORJUSDT', 'ARDRUSDT', 'RADUSDT', 'CTKUSDT', 'OGNUSDT', 'REQUSDT', 'RAREUSDT', 'ARPAUSDT', 'MDTUSDT', 'ATAUSDT',
   'DATAUSDT', 'IRISUSDT', 'FIDAUSDT', 'KMDUSDT', 'AVAUSDT', 'NULSUSDT', 'SANTOSUSDT', 'VIDTUSDT', 'DREPUSDT', 'BURGERUSDT', 
   'OGUSDT', 'FIOUSDT', 'FIROUSDT','IDUSDT','SYSUSDT','COSUSDT','TWTUSDT','QTUMUSDT','GRTUSDT','EOSUSDT','DCRUSDT', 'OXTUSDT','WTCUSDT', 'PUNDIXUSDT', 'TFUELUSDT', 'SXPUSDT',  'XMRUSDT','BICOUSDT',  'CKBUSDT',  'SFPUSDT','TVKUSDT','PAXGUSDT', 'POWRUSDT','GASUSDT','QKCUSDT', 'PROMUSDT',  'RLCUSDT', 'VTHOUSDT',   'DOCKUSDT',  'HIVEUSDT', 'AMPUSDT', 'BANDUSDT','MTLUSDT']);


   const intervals = ['1h','4h','1d','1w'];

const limitMap = {
   '15m': 580,
   '5m': 900,
  '1h': 480,
  '4h': 540,
  '1d': 180,
  '1w':30
};


const fetchVolumeProfile = async (symbol, interval) => {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limitMap[interval]}`;

  try {
      const response = await fetch(url,{ timeout: 50000});
      const data = await response.json();
      if (!Array.isArray(data)) {
          throw new Error('Data is not an array');
      }
      const dateValues = data.map(item => new Date(item[0]));
      const openValues = data.map(item => parseFloat(item[1]));
      const highValues = data.map(item => parseFloat(item[2]));
      const lowValues = data.map(item => parseFloat(item[3]));
      const closeValues = data.map(item => parseFloat(item[4]));
      const volumeValues = data.map(item => parseFloat(item[5]));
      //  console.log(closeValues);
      const volumeProfile = {};
      const volumeProfiles = {};
      const binSize = 25.0; // Define your bin size

      // Function to calculate the bin for a given price
      function getBin(price, binSize) {
          if(Math.floor(price / binSize) * binSize>0){
              return (Math.floor(price / binSize) * binSize);
          }else{
               return price;
          }
         
        
      }
  function distributeVolume(high, low, volume, binSize) {
  const startBin = getBin(low, binSize);
  const endBin = getBin(high, binSize);

  let totalBins = (endBin - startBin) / binSize + 1;
  const volumePerBin = volume / totalBins;

  for (let bin = startBin; bin <= endBin; bin += binSize) {
    if (volumeProfile[bin.toFixed(3)]) {
      volumeProfile[bin.toFixed(3)] += volumePerBin;
    } else {
      volumeProfile[bin.toFixed(3)] = volumePerBin;
    }
     
  }
}
      for (let i = 0; i < highValues.length; i++) {
           distributeVolume(highValues[i], lowValues[i], volumeValues[i], binSize);
          // console.log(highValues[i]);
          // console.log(lowValues[i]);
         
          
      }

      // console.log(volumeProfile);

  
      const currentPrice = closeValues[closeValues.length - 1];
     

  
      //  bot.sendMessage(295945684, message);
      //     console.log(message);
      return { symbol, interval, volumeProfile,currentPrice};
  } catch (error) {
      // console.error('Error fetching data:', error);
      // return null;
  }
};
function sendMessageToBot(message,symbol) {
  const chatId = 295945684; // Replace 'YOUR_CHAT_ID' with your actual chat ID
  var url = 'https://ru.tradingview.com/chart/?symbol='+symbol;
  // const message = 'Hello from your bot!'; // Message to send
  const keyboard = {
      inline_keyboard: [
          [{ text: 'tradingview', url: url }]
      ]
  };
  bot.sendMessage(chatId, message, { reply_markup: JSON.stringify(keyboard) })
      .then(() => {
          // console.log(message);
      })
      .catch((err) => {
          // console.error('Error sending message:', err);
      });
}
const fetchAllVolumeProfiles = async (symbol,interval) => {
  const results = await Promise.all(Array.from([symbol]).flatMap(symbol => [interval].map(interval => fetchVolumeProfile(symbol, interval))));
  await new Promise(resolve => setTimeout(resolve, 2000));
let data=results.filter(Boolean); // Filter out any null results
  data.forEach(obj => {
      let message = ``;
  
  let maxVolume = 0;
let pocLevel = null;
let cumulativeVolume = 0;
  for (const [price, volume] of Object.entries(obj.volumeProfile)) {
  
      cumulativeVolume += volume;

     if (volume > maxVolume) {
       maxVolume = volume;
       pocLevel = price;
   }
  
 }
        if(pocLevel==obj.currentPrice.toFixed(3)  && pocLevel>0){
       
          message += `
          Сигнал Коин #${obj.symbol}                  
          Таймфрейм #${obj.interval}
          Текущая цена  ${pocLevel}
          Текущая цена  ${obj.currentPrice.toFixed(3)}
        
            `;
            // console.log(message)
          }
         sendMessageToBot(message,obj.symbol)
      
    
  });
};
const createWebSocketConnection = (symbol, interval) => {
  const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`;
  
  const ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    // console.log(`WebSocket connection opened for ${symbol} at interval ${interval}`);
  });

  ws.on('message', (data) => {
    const parsedData = JSON.parse(data);
    // console.log(parsedData)
    handleWebSocketData(parsedData, symbol, interval);
  });

  ws.on('close', () => {
    console.log(`WebSocket connection closed for ${symbol} at interval ${interval}`);
    // Optionally, reconnect after a delay
    setTimeout(() => createWebSocketConnection(symbol, interval), 10000);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${symbol} at interval ${interval}:`, error);
  });
};

const handleWebSocketData = (data, symbol, interval) => {
  const kline = data.k;
  if (kline.x) { // x is true when the kline is closed
    const open = parseFloat(kline.o);
    const high = parseFloat(kline.h);
    const low = parseFloat(kline.l);
    const close = parseFloat(kline.c);
    const volume = parseFloat(kline.v);
    // console.log(close)
  
    // Process the volume profile
      const volumeProfile = {};
       const binSize = 25.0;
       const getBin = (price, binSize) => Math.floor(price / binSize) * binSize;

        const distributeVolume = (high, low, volume, binSize) => {
      const startBin = getBin(low, binSize);
     const endBin = getBin(high, binSize);
        const totalBins = (endBin - startBin) / binSize + 1;
          const volumePerBin = volume / totalBins;

       for (let bin = startBin; bin <= endBin; bin += binSize) {
             volumeProfile[bin] = (volumeProfile[bin] || 0) + volumePerBin;
       }
          };

        distributeVolume(high, low, volume, binSize);

     const currentPrice = close;

//     // Find POC
      let maxVolume = 0;
      let pocLevel = null;

    // for (const [price, volume] of Object.entries(volumeProfile)) {
    //   if (volume > maxVolume) {
    //     maxVolume = volume;
    //     pocLevel = price;
    //   }
    // }    
 
        // console.log(`Таймфрейм #${interval}`)
        // console.log(`Коин  #${symbol}`)
        // console.log('Текущая цена'+currentPrice)

//     if (pocLevel == currentPrice) {
    //   const message = `
    //     Сигнал Коин #${symbol}
    //     Таймфрейм #${interval}
    //     Текущая цена ${pocLevel}`;
    //   console.log(message);
//     //   sendMessageToBot(message, symbol);
//     }
   }
   fetchAllVolumeProfiles(symbol,interval) 
};
 

const main = () => {
  symbols.forEach(symbol => {
    intervals.forEach(interval => {
      createWebSocketConnection(symbol, interval);
    });
  });
};

main();
