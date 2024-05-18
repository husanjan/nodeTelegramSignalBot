 function Main(){

 
const TelegramBot = require('node-telegram-bot-api');
// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot('6526656429:AAEE2CXHPh9t_nZApTJ8hwMRkFR1iWL7qO8', { polling: true });
    const symbols = new Set(['BTCUSDT', 'ICPUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 
    'TRXUSDT', 'LINKUSDT', 'MATICUSDT', 'BCHUSDT', 'LTCUSDT', 'NEARUSDT', 'FILUSDT', 'ATOMUSDT', 'APTUSDT', 'OPUSDT', 
    'STXUSDT', 'HBARUSDT', 'XLMUSDT', 'VETUSDT', 'FETUSDT', 'GALAUSDT', 'FTMUSDT', 'ALGOUSDT', 'FLOWUSDT', 
    'EGLDUSDT', 'QNTUSDT', 'AGIXUSDT', 'MINAUSDT', 'MANAUSDT', 'APEUSDT', 'CHZUSDT', 'XECUSDT', 'CFXUSDT', 'ROSEUSDT', 
    'JASMYUSDT', 'IOTAUSDT', 'LPTUSDT', 'GMTUSDT', 'TWTUSDT', 'GLMUSDT', 'ZILUSDT', 'CELOUSDT', 'SCUSDT', 'QTUMUSDT', 'SKLUSDT', 
    'ZECUSDT', 'MASKUSDT', 'XEMUSDT', 'DASHUSDT', 'WAVESUSDT', 'PONDUSDT', 'TRBUSDT', 'STRAXUSDT', 'MOVRUSDT', 'SCRTUSDT', 'CELRUSDT',
     'PHBUSDT', 'DUSKUSDT', 'CTXCUSDT', 'OMGUSDT', 'ACHUSDT', 'ONGUSDT', 'BLZUSDT', 'LOOMUSDT', 'AGLDUSDT', 'PHAUSDT', 'NKNUSDT',
      'STMXUSDT', 'STORJUSDT', 'ARDRUSDT', 'RADUSDT', 'CTKUSDT', 'OGNUSDT', 'REQUSDT', 'RAREUSDT', 'ARPAUSDT', 'MDTUSDT', 'ATAUSDT',
       'DATAUSDT', 'IRISUSDT', 'FIDAUSDT', 'KMDUSDT', 'AVAUSDT', 'NULSUSDT', 'SANTOSUSDT', 'VIDTUSDT', 'DREPUSDT', 'BURGERUSDT', 
       'OGUSDT', 'FIOUSDT', 'FIROUSDT','IDUSDT','BICOUSDT','VTHOUSDT']);
    
    const intervals = ['5m', '15m', '1h', '4h', '1d'];
    const limitMap = {
        '5m': 864,
        '15m': 480,
        '1h': 360,
        '4h': 540,
        '1d': 180
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
        //  console.log(closeValues);
        const volumeValues = data.map(item => parseFloat(item[5]));
        const currentPrice = closeValues[closeValues.length - 1];
        // Calculate True Range (TR) for each candle
const trueRanges = [];
for (let i = 0; i < closeValues.length - 1; i++) {
    const high = highValues[i];
    const low = lowValues[i];
    const close = closeValues[i];
    const prevClose = i === 0 ? closeValues[0] : closeValues[i - 1];
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trueRanges.push(tr);
}

// Calculate Average True Range (ATR)
const atr = trueRanges.reduce((acc, tr) => acc + tr, 0) / trueRanges.length;

// Calculate the ATR price range for the middle five candles
const middleStartIndex = Math.floor(trueRanges.length / 2) - 2;
const middleEndIndex = Math.floor(trueRanges.length / 2) + 2;
const middleAtrPriceRange = atr * 5; // ATR multiplied by 5 for the middle five candles

// console.log('Average True Range (ATR):', atr);
// console.log('  (symbol):', symbol);
// console.log('  (interval):', interval);
// console.log('Middle ATR Price Range:', middleAtrPriceRange);

        // Calculate volume profile
        let totalVolume = volumeValues.reduce((acc, volume) => acc + volume, 0);
        let valueAreaVolume = totalVolume * 0.7; // Value Area represents 70% of total volume
        let cumulativeVolume = 0;
        let poc = null;
        let val = null;
        let vah = null;
        
        for (let i = 0; i < dateValues.length; i++) {
            cumulativeVolume += volumeValues[i];
            if (poc === null && cumulativeVolume >= totalVolume / 2) {
                poc = closeValues[i];
            }
            if (val === null && cumulativeVolume >= valueAreaVolume / 2) {
                val = closeValues[i];
            }
            if (vah === null && cumulativeVolume >= valueAreaVolume) {
                vah = closeValues[i];
                break;
            }
        }
        //  bot.sendMessage(295945684, message);
        //     console.log(message);
        return { symbol, interval, poc, val, vah,currentPrice,middleAtrPriceRange };
    } catch (error) {
        // console.error('Error fetching data:', error);
        // return null;
    }
};

///Telegram bot
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

// send Telegram bot



const fetchAllVolumeProfiles = async () => {
    const results = await Promise.all(Array.from(symbols).flatMap(symbol => intervals.map(interval => fetchVolumeProfile(symbol, interval))));
    await new Promise(resolve => setTimeout(resolve, 2000));
  let data=results.filter(Boolean); // Filter out any null results
    data.forEach(obj => {
        let message = ``;
    //     if(obj.currentPrice==obj.poc && obj.interval=='5m'){
    //         message += `
    // Сигнал Коин #${ obj.symbol}                  
    // Таймфрейм #${obj.interval}
    // 💲 Ценовой уровень: ${obj.poc}
    // Cамая низкая цена в зоне стоимости  ${obj.vah}
    // Текущая цена    ${obj.currentPrice}
          
    //         `;
    //     // console.log("Symbol:", obj.symbol);
    //     // console.log("Interval:", obj.interval);
    //     // console.log("POC:", obj.poc);
    //     // console.log("VAL:", obj.val);
    //     // console.log("VAH:", obj.vah);
    //     // console.log("Current Price:", obj.currentPrice);
    //     }
    //     if(obj.currentPrice==obj.poc &&  obj.interval=='15m'){
    //         message += `
    // Сигнал Коин #${ obj.symbol}                  
    // Таймфрейм #${obj.interval}
    // 💲 Ценовой уровень: ${obj.poc}
    // Cамая низкая цена в зоне стоимости  ${obj.vah}
    // Текущая цена    ${obj.currentPrice}
          
    //         `;
    //     // console.log("Symbol:", obj.symbol);
    //     // console.log("Interval:", obj.interval);
    //     // console.log("POC:", obj.poc);
    //     // console.log("VAL:", obj.val);
    //     // console.log("VAH:", obj.vah);
    //     // console.log("Current Price:", obj.currentPrice);
    //     }
        if(obj.currentPrice==obj.poc){
            // console.log("Symbol:", obj.symbol);
            // console.log("Interval:", obj.interval);
            // console.log("POC:", obj.poc);
            // console.log("VAL:", obj.val);
            // console.log("VAH:", obj.vah);
            // console.log("Current Price:", obj.currentPrice);
            message += `
     Сигнал Коин #${obj.symbol}                  
     Таймфрейм #${obj.interval}
     💲 Ценовой уровень: ${obj.poc}
      Cамая низкая цена в зоне стоимости  ${obj.vah}
     Текущая цена  ${obj.currentPrice}
   
  
            `;
            } 

            sendMessageToBot(message,obj.symbol)       
      
    });
};

// setInterval(sendMessageToBot, 60000); // 60000 milliseconds = 1 minute

 fetchAllVolumeProfiles() 
 
 
 }

 setInterval(Main, 60000);