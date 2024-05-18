 function Main(){

 
const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot('6526656429:AAEE2CXHPh9t_nZApTJ8hwMRkFR1iWL7qO8', { polling: true });
const symbols = new Set(['BTCUSDT']);
    
    const intervals = ['1d'];
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
        const volumeValues = data.map(item => parseFloat(item[5]));
        //  console.log(closeValues);
        const volumeProfile = {};
        const binSize = 25.0; // Define your bin size

        // Function to calculate the bin for a given price
        function getBin(price, binSize) {
            return Math.floor(price / binSize) * binSize;
        }
    function distributeVolume(high, low, volume, binSize) {
		const startBin = getBin(low, binSize);
		const endBin = getBin(high, binSize);

		let totalBins = (endBin - startBin) / binSize + 1;
		const volumePerBin = volume / totalBins;

		for (let bin = startBin; bin <= endBin; bin += binSize) {
			if (volumeProfile[bin]) {
				volumeProfile[bin] += volumePerBin;
			} else {
				volumeProfile[bin] = volumePerBin;
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
    //     if(obj.currentPrice==obj.poc){
    //         // console.log("Symbol:", obj.symbol);
    //         // console.log("Interval:", obj.interval);
    //         // console.log("POC:", obj.poc);
    //         // console.log("VAL:", obj.val);
    //         // console.log("VAH:", obj.vah);
    //         // console.log("Current Price:", obj.currentPrice);
    
    //         } 
    let maxVolume = 0;
let pocLevel = null;
let cumulativeVolume = 0;
    for (const [price, volume] of Object.entries(obj.volumeProfile)) {
    
        cumulativeVolume += volume;
    //    xVolValues.push(parseFloat(price)); // Convert string key back to number
    //    yVolValues.push(volume);
       // const totalVolume = yVolValues.reduce((sum, dataItem) => sum + volume, 0);
       if (volume > maxVolume) {
         maxVolume = volume;
         pocLevel = price;
     }
    
   }
          if(pocLevel==obj.currentPrice){
         

            }
            message += `
            Сигнал Коин #${obj.symbol}                  
            Таймфрейм #${obj.interval}
              Текущая цена  ${pocLevel}`;
              console.log(message)
      
    });
};

// setInterval(sendMessageToBot, 120000); // 60000 milliseconds = 1 minute

 fetchAllVolumeProfiles() 
 
 
 }

//  setInterval(Main, 60000);
Main()