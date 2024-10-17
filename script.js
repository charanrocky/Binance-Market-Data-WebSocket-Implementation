const chartCtx = document.getElementById('candlestickChart').getContext('2d');
let chart;
const historicalData = {}; // Object to store historical data
const coinSelector = document.getElementById('coinSelector');
const intervalSelector = document.getElementById('intervalSelector');

// Function to create a new chart
function createChart(data) {
    if (chart) {
        chart.destroy(); // Destroy the previous chart instance
    }


    
    chart = new Chart(chartCtx, {
        type: 'candlestick', // Use candlestick type
        data: {
            datasets: [{
                label: 'Candlestick Data',
                data: data,
                borderColor: 'rgba(0, 123, 255, 1)',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute'
                    }
                }
            }
        }
    });
}

// Function to connect to WebSocket
function connectWebSocket(symbol, interval) {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`);

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const candlestick = message.k;
        if (candlestick.x) { // Only process closed candles
            const dataPoint = {
                t: candlestick.t,
                o: candlestick.o,
                h: candlestick.h,
                l: candlestick.l,
                c: candlestick.c,
                v: candlestick.v
            };

            // Store historical data
            if (!historicalData[symbol]) {
                historicalData[symbol] = [];
            }
            historicalData[symbol].push(dataPoint);
            localStorage.setItem(symbol, JSON.stringify(historicalData[symbol]));

            // Update chart
            createChart(historicalData[symbol]);
        }
    };
}

// Event listeners for dropdown changes
coinSelector.addEventListener('change', (event) => {
    const selectedCoin = event.target.value;
    const selectedInterval = intervalSelector.value;
    const symbol = selectedCoin.toUpperCase();
    
    // Load historical data from local storage
    const storedData = localStorage.getItem(symbol);
    historicalData[symbol] = storedData ? JSON.parse(storedData) : [];

    // Connect to WebSocket for the selected coin and interval
    connectWebSocket(symbol, selectedInterval);
});

intervalSelector.addEventListener('change', (event) => {
    const selectedInterval = event.target.value;
    const selectedCoin = coinSelector.value;
    const symbol = selectedCoin.toUpperCase();

    // Connect to WebSocket for the selected coin and interval
    connectWebSocket(symbol, selectedInterval);
});

// Initialize the chart with default values
coinSelector.value = 'ethusdt';
intervalSelector.value = '1m';
connectWebSocket('ETHUSDT', '1m');