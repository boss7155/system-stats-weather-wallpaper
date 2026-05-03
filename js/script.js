// =====================================================
// SYSTEM STATS + WEATHER WALLPAPER
// Original chart code from: https://github.com/rocksdanister/system-stats-wallpaper
// Added: Clock + Weather widget with animated icons
// =====================================================

// ===== КОНФИГУРАЦИЯ =====
var CONFIG = {
    weatherApiKey: 'fb03172bdbe0819e4c53d9695ab10474',
    weatherCity: 'Brest',
    weatherCountryCode: 'BY',
    timezone: 'Europe/Minsk',
    weatherLang: 'ru',
    weatherRefreshInterval: 10 * 60 * 1000,
    weatherUnits: 'metric',
};

// ===== CHART VARIABLES (ORIGINAL) =====
var cpuCounter = 0;
var gpuCounter = 0;
var netDownCounter = 0;
var netUpCounter = 0;
var memTotal = 1;
var memFree = 0;
var cpuName = "";
var gpuName = "";
var memoryName = "";
var netCardName = "";
var isChartInit = false;

var chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(0, 192, 0)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
    lightGrey: 'rgb(105, 105, 105)',
    black: 'rgb(0, 0, 0)',
};
var color = Chart.helpers.color;

//global chart defaults
Chart.defaults.global.legend.display = false;
Chart.defaults.global.responsive = true;
Chart.defaults.global.elements.pointRadius = 0;
Chart.defaults.global.tooltips.enabled = false;

var cpuChartConfig = {
    type: 'line',
    data: {
        datasets: [{
            label: 'Dataset 1',
            backgroundColor: color(chartColors.grey).alpha(0.5).rgbString(),
            borderColor: chartColors.grey,
            fill: false,
            lineTension: 0,
            borderDash: [0, 0],
            pointRadius: 0,
            data: []
        }],
    },
    options: {   
        maintainAspectRatio: false,   
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: 'Processor',
        },
        scales: {
            xAxes: [{
                type: 'realtime',
                realtime: {
                    duration: 20000,
                    refresh: 1000,
                    delay: 1000,
                    onRefresh: onRefresh
                },
                ticks: {
                    display: false, 
                },
            }],
            yAxes: [{
                scaleLabel: {
                    display: false,
                    labelString: '%'
                },
                ticks: {
                    beginAtZero: true,
                    max : 100
                }
            }]
        },
    }
};

var gpuChartConfig = {
    type: 'line',
    data: {
        datasets: [{
            label: 'Dataset 1 (linear interpolation)',
            backgroundColor: color(chartColors.grey).alpha(0.5).rgbString(),
            borderColor: chartColors.grey,
            fill: false,
            lineTension: 0,
            borderDash: [0, 0],
            pointRadius: 0,
            data: []
        }]
    },
    options: {   
        maintainAspectRatio: false,          
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: 'Graphics',
        },
        scales: {
            xAxes: [{
                type: 'realtime',
                realtime: {
                    duration: 20000,
                    refresh: 1000,
                    delay: 1000,
                    onRefresh: onRefresh
                },
                ticks: {
                    display: false, 
                },
            }],
            yAxes: [{
                scaleLabel: {
                    display: false,
                    labelString: '%'
                },
                 ticks: {
                    beginAtZero: true,
                    max : 100
            }
            }]
        },
    }
};

var netChartConfig = {
    type: 'line',
    data: {
        datasets: [{
            label: 'Net Down',
            backgroundColor: color(chartColors.grey).alpha(0.5).rgbString(),
            borderColor: chartColors.grey,
            fill: false,
            lineTension: 0,
            borderDash: [0, 0],
            pointRadius: 0,
            data: []
        },
        {
            label: 'Net Up',
            backgroundColor: color(chartColors.lightGrey).alpha(0.5).rgbString(),
            borderColor: chartColors.lightGrey,
            fill: false,
            lineTension: 0,
            borderDash: [0, 0],
            pointRadius: 0,
            data: []
        }]
    },
    options: {          
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: 'Network',
        },
        scales: {
            xAxes: [{
                type: 'realtime',
                realtime: {
                    duration: 20000,
                    refresh: 1000,
                    delay: 1000,
                    onRefresh: onRefresh
                },
                ticks: {
                    display: false, 
                },
            }],
            yAxes: [{
                scaleLabel: {
                    display: false,
                    labelString: '%'
                },
                 ticks: {
                    beginAtZero: true,
                    suggestedMax : 100
            }
            }]
        },
    }
};

var ramChartConfig = {
    type: 'line',
    data: {
        datasets: [{
            label: 'Dataset 1 (linear interpolation)',
            backgroundColor: color(chartColors.grey).alpha(0.5).rgbString(),
            borderColor: chartColors.grey,
            fill: false,
            lineTension: 0,
            borderDash: [0, 0],
            pointRadius: 0,
            data: []
        }]
    },
    options: {
        maintainAspectRatio: false,           
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: memoryName,
        },
        scales: {
            xAxes: [{
                type: 'realtime',
                realtime: {
                    duration: 20000,
                    refresh: 1000,
                    delay: 1000,
                    onRefresh: onRefresh
                },
                ticks: {
                    display: false, 
                },
            }],
            yAxes: [{
                scaleLabel: {
                    display: false,
                    labelString: '%'
                },
                 ticks: {
                    beginAtZero: true,
                    max : 100,
            }
            }]
        },
    }
};

function onRefresh(chart) 
{
    var data = [];
    switch(chart)
    {
        case cpuChart:
            data[0] = cpuCounter;
            break;
        case gpuChart:
            data[0] = gpuCounter;
            break;
        case netChart:
            data[0] = netDownCounter;
            data[1] = netUpCounter;
            break;
        case ramChart:
            data[0] = (memTotal - memFree)*100/memTotal;
            break;  
    }

    var i = 0;
    chart.config.data.datasets.forEach(
        function(dataset) {
        dataset.data.push({
            x: Date.now(),
            y: data[i],
        });
        i++;
    });
}

var cpuChart, gpuChart, netChart, ramChart;
function initChart() 
{
    cpuChartConfig.options.title.text = cpuName;
    gpuChartConfig.options.title.text = gpuName;
    netChartConfig.options.title.text = netCardName;
    ramChartConfig.options.title.text = memoryName;

    var ctxCpu = document.getElementById('cpuChart').getContext('2d');
    cpuChart = new Chart(ctxCpu, cpuChartConfig);

    var ctxGpu = document.getElementById('gpuChart').getContext('2d');
    gpuChart = new Chart(ctxGpu, gpuChartConfig);

    var ctxNet = document.getElementById('netChart').getContext('2d');
    netChart = new Chart(ctxNet, netChartConfig);

    var ctxRam = document.getElementById('ramChart').getContext('2d');
    ramChart = new Chart(ctxRam, ramChartConfig);
};

function livelySystemInformation(data)
{
    var obj = JSON.parse(data);

    //hw name
    cpuName = obj.NameCpu;
    gpuName = obj.NameGpu;
    netCardName = obj.NameNetCard;
    memoryName = "Memory (" + obj.TotalRam/1024 + " GB)";

    //chart data.
    cpuCounter = obj.CurrentCpu;
    gpuCounter = obj.CurrentGpu3D;
    netDownCounter = (obj.CurrentNetDown*8)/(1024*1024);
    netUpCounter = (obj.CurrentNetUp*8)/(1024*1024);
    memFree = obj.CurrentRamAvail;
    memTotal = obj.TotalRam;

    if(!isChartInit)
    {
        isChartInit = true;
        initChart();
    }
}


// =====================================================
// CLOCK
// =====================================================

function updateClock() {
    var now = new Date();
    var timeStr = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: CONFIG.timezone,
    });
    var dateStr = now.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: CONFIG.timezone,
    });
    var el1 = document.getElementById('clockTime');
    var el2 = document.getElementById('clockDate');
    if (el1) el1.textContent = timeStr;
    if (el2) el2.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}
setInterval(updateClock, 1000);
updateClock();


// =====================================================
// WEATHER
// =====================================================

function fetchWeather() {
    if (CONFIG.weatherApiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
        document.getElementById('weatherTemp').textContent = '--°';
        document.getElementById('weatherDesc').textContent = 'Настройте API ключ';
        document.getElementById('weatherCity').textContent = CONFIG.weatherCity;
        renderWeatherIcon('clear');
        return;
    }
    var url = 'https://api.openweathermap.org/data/2.5/weather'
        + '?q=' + encodeURIComponent(CONFIG.weatherCity + ',' + CONFIG.weatherCountryCode)
        + '&appid=' + CONFIG.weatherApiKey
        + '&units=' + CONFIG.weatherUnits
        + '&lang=' + CONFIG.weatherLang;

    fetch(url)
        .then(function (response) { return response.json(); })
        .then(function (data) {
            if (data.cod && data.cod !== 200) {
                document.getElementById('weatherDesc').textContent = 'Ошибка: ' + (data.message || 'неизвестно');
                return;
            }
            var temp = Math.round(data.main.temp);
            var desc = data.weather[0].description;
            var city = data.name;
            var iconCode = data.weather[0].icon;

            document.getElementById('weatherTemp').textContent = temp + '°';
            document.getElementById('weatherDesc').textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
            document.getElementById('weatherCity').textContent = city;

            var weatherType = mapWeatherIcon(iconCode, data.weather[0].id);
            renderWeatherIcon(weatherType);
        })
        .catch(function (err) {
            document.getElementById('weatherDesc').textContent = 'Нет связи';
        });
}

function mapWeatherIcon(iconCode, id) {
    if (id >= 200 && id < 300) return 'storm';
    if (id >= 300 && id < 400) return 'rain';
    if (id >= 500 && id < 600) { if (id === 511) return 'snow'; return 'rain'; }
    if (id >= 600 && id < 700) return 'snow';
    if (id >= 700 && id < 800) return 'mist';
    if (id === 800) return iconCode.endsWith('n') ? 'clear-night' : 'clear';
    if (id > 800) { if (id === 801 || id === 802) return 'partly-cloudy'; return 'cloudy'; }
    return 'clear';
}


// =====================================================
// ANIMATED WEATHER ICONS
// =====================================================

function renderWeatherIcon(type) {
    var wrap = document.getElementById('weatherIconWrap');
    if (!wrap) return;
    switch (type) {
        case 'clear': wrap.innerHTML = renderSunnyIcon(); break;
        case 'clear-night': wrap.innerHTML = renderNightIcon(); break;
        case 'partly-cloudy': wrap.innerHTML = renderPartlyCloudyIcon(); break;
        case 'cloudy': wrap.innerHTML = renderCloudyIcon(); break;
        case 'rain': wrap.innerHTML = renderRainIcon(); break;
        case 'snow': wrap.innerHTML = renderSnowIcon(); break;
        case 'storm': wrap.innerHTML = renderStormIcon(); break;
        case 'mist': wrap.innerHTML = renderMistIcon(); break;
        default: wrap.innerHTML = renderSunnyIcon();
    }
}

function renderSunnyIcon() {
    var rays = '';
    for (var i = 0; i < 12; i++) {
        rays += '<div class="sun-ray" style="transform:rotate(' + (i * 30) + 'deg) translateY(-48px)"></div>';
    }
    return '<div class="weather-icon-sunny"><div class="sun-core"></div>' + rays + '</div>';
}

function renderNightIcon() {
    return '<div class="weather-icon-sunny" style="filter:hue-rotate(200deg) brightness(0.6)">' +
        '<div class="sun-core" style="background:radial-gradient(circle,#c8d8f0,#8a9cc0);box-shadow:0 0 25px rgba(150,170,220,0.4)"></div>' +
        '</div>';
}

function renderCloudyIcon() {
    return '<div class="weather-icon-cloudy"><div class="cloud cloud-back"></div><div class="cloud cloud-main"></div></div>';
}

function renderPartlyCloudyIcon() {
    return '<div class="weather-icon-partly-cloudy"><div class="mini-sun"></div><div class="cloud cloud-main"></div></div>';
}

function renderRainIcon() {
    var drops = '';
    var positions = [
        { left: 24, delay: 0, height: 16 },
        { left: 36, delay: 0.3, height: 20 },
        { left: 48, delay: 0.6, height: 14 },
        { left: 60, delay: 0.15, height: 18 },
        { left: 72, delay: 0.45, height: 16 },
        { left: 30, delay: 0.7, height: 12 },
        { left: 54, delay: 0.2, height: 20 },
        { left: 66, delay: 0.55, height: 14 },
    ];
    for (var i = 0; i < positions.length; i++) {
        var p = positions[i];
        drops += '<div class="raindrop" style="left:' + p.left + 'px;top:55px;height:' + p.height + 'px;animation-duration:0.7s;animation-delay:' + p.delay + 's"></div>';
    }
    return '<div class="weather-icon-rainy"><div class="cloud cloud-main"></div>' + drops + '</div>';
}

function renderSnowIcon() {
    var flakes = '';
    var positions = [
        { left: 26, delay: 0, size: 9 },
        { left: 38, delay: 0.8, size: 7 },
        { left: 50, delay: 0.4, size: 11 },
        { left: 62, delay: 1.2, size: 8 },
        { left: 74, delay: 0.6, size: 10 },
        { left: 32, delay: 1.0, size: 6 },
        { left: 56, delay: 0.2, size: 9 },
        { left: 68, delay: 0.9, size: 7 },
    ];
    for (var i = 0; i < positions.length; i++) {
        var p = positions[i];
        flakes += '<div class="snowflake" style="left:' + p.left + 'px;top:55px;font-size:' + p.size + 'px;animation-duration:2.5s;animation-delay:' + p.delay + 's">*</div>';
    }
    return '<div class="weather-icon-snowy"><div class="cloud cloud-main"></div>' + flakes + '</div>';
}

function renderStormIcon() {
    var drops = '';
    var positions = [
        { left: 26, delay: 0, height: 14 },
        { left: 40, delay: 0.3, height: 18 },
        { left: 54, delay: 0.5, height: 12 },
        { left: 68, delay: 0.15, height: 16 },
    ];
    for (var i = 0; i < positions.length; i++) {
        var p = positions[i];
        drops += '<div class="raindrop" style="left:' + p.left + 'px;top:70px;height:' + p.height + 'px;animation-duration:0.5s;animation-delay:' + p.delay + 's"></div>';
    }
    return '<div class="weather-icon-stormy"><div class="cloud cloud-main"></div>' +
        '<div class="lightning-bolt"><svg viewBox="0 0 30 50" fill="none"><polygon points="18,0 8,22 15,22 10,50 25,18 17,18 22,0" fill="#FFD93D" opacity="0.9"/></svg></div>' +
        drops + '</div>';
}

function renderMistIcon() {
    var lines = '';
    var configs = [
        { top: 30, left: 8, width: 84, delay: 0 },
        { top: 42, left: 16, width: 68, delay: 1.5 },
        { top: 54, left: 4, width: 92, delay: 3 },
        { top: 66, left: 20, width: 60, delay: 4.5 },
    ];
    for (var i = 0; i < configs.length; i++) {
        var c = configs[i];
        lines += '<div class="mist-line" style="top:' + c.top + 'px;left:' + c.left + 'px;width:' + c.width + 'px;animation-delay:' + c.delay + 's"></div>';
    }
    return '<div class="weather-icon-misty">' + lines + '</div>';
}


// =====================================================
// INIT
// =====================================================

fetchWeather();
setInterval(fetchWeather, CONFIG.weatherRefreshInterval);
