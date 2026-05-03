// =====================================================
// SYSTEM STATS + WEATHER WALLPAPER
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

// ===== CHART VARIABLES =====
var cpuCounter = 0;
var gpuCounter = 0;
var netDownCounter = 0;
var netUpCounter = 0;
var memTotal = 1;
var memFree = 0;
var cpuName = "CPU";
var gpuName = "GPU";
var memoryName = "RAM";
var netCardName = "Network";
var isChartInit = false;
var livelyConnected = false; // true when livelySystemInformation was called

var chartColors = {
    cpu: 'rgb(0, 200, 255)',
    gpu: 'rgb(180, 100, 255)',
    ram: 'rgb(0, 255, 150)',
    netDown: 'rgb(255, 160, 0)',
    netUp: 'rgb(255, 80, 120)',
    grey: 'rgb(100, 100, 100)',
};
var color = Chart.helpers.color;

// Global chart defaults — dark theme
Chart.defaults.global.defaultFontColor = 'rgba(255,255,255,0.6)';
Chart.defaults.global.defaultFontFamily = 'Monospace';
Chart.defaults.global.defaultFontSize = 11;
Chart.defaults.global.legend.display = false;
Chart.defaults.global.responsive = true;
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.global.elements.pointRadius = 0;
Chart.defaults.global.tooltips.enabled = false;
Chart.defaults.global.animation.duration = 0;

// ===== CHART CONFIGS =====

var cpuChartConfig = {
    type: 'line',
    data: {
        datasets: [{
            label: 'CPU',
            backgroundColor: color(chartColors.cpu).alpha(0.15).rgbString(),
            borderColor: chartColors.cpu,
            borderWidth: 1.5,
            fill: true,
            lineTension: 0.3,
            pointRadius: 0,
            data: []
        }],
    },
    options: {
        maintainAspectRatio: false,
        legend: { display: false },
        title: {
            display: true,
            text: 'CPU',
            fontColor: 'rgba(255,255,255,0.7)',
            fontSize: 12,
            padding: 6,
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
                ticks: { display: false },
                gridLines: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            }],
            yAxes: [{
                scaleLabel: { display: false },
                ticks: {
                    beginAtZero: true,
                    max: 100,
                    fontColor: 'rgba(255,255,255,0.3)',
                    fontSize: 9,
                    maxTicksLimit: 5,
                },
                gridLines: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            }]
        },
    }
};

var gpuChartConfig = {
    type: 'line',
    data: {
        datasets: [{
            label: 'GPU',
            backgroundColor: color(chartColors.gpu).alpha(0.15).rgbString(),
            borderColor: chartColors.gpu,
            borderWidth: 1.5,
            fill: true,
            lineTension: 0.3,
            pointRadius: 0,
            data: []
        }]
    },
    options: {
        maintainAspectRatio: false,
        legend: { display: false },
        title: {
            display: true,
            text: 'GPU',
            fontColor: 'rgba(255,255,255,0.7)',
            fontSize: 12,
            padding: 6,
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
                ticks: { display: false },
                gridLines: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            }],
            yAxes: [{
                scaleLabel: { display: false },
                ticks: {
                    beginAtZero: true,
                    max: 100,
                    fontColor: 'rgba(255,255,255,0.3)',
                    fontSize: 9,
                    maxTicksLimit: 5,
                },
                gridLines: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            }]
        },
    }
};

var ramChartConfig = {
    type: 'line',
    data: {
        datasets: [{
            label: 'RAM',
            backgroundColor: color(chartColors.ram).alpha(0.15).rgbString(),
            borderColor: chartColors.ram,
            borderWidth: 1.5,
            fill: true,
            lineTension: 0.3,
            pointRadius: 0,
            data: []
        }]
    },
    options: {
        maintainAspectRatio: false,
        legend: { display: false },
        title: {
            display: true,
            text: 'RAM',
            fontColor: 'rgba(255,255,255,0.7)',
            fontSize: 12,
            padding: 6,
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
                ticks: { display: false },
                gridLines: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            }],
            yAxes: [{
                scaleLabel: { display: false },
                ticks: {
                    beginAtZero: true,
                    max: 100,
                    fontColor: 'rgba(255,255,255,0.3)',
                    fontSize: 9,
                    maxTicksLimit: 5,
                },
                gridLines: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            }]
        },
    }
};

var netChartConfig = {
    type: 'line',
    data: {
        datasets: [{
            label: 'Download',
            backgroundColor: color(chartColors.netDown).alpha(0.15).rgbString(),
            borderColor: chartColors.netDown,
            borderWidth: 1.5,
            fill: true,
            lineTension: 0.3,
            pointRadius: 0,
            data: []
        },
        {
            label: 'Upload',
            backgroundColor: color(chartColors.netUp).alpha(0.1).rgbString(),
            borderColor: chartColors.netUp,
            borderWidth: 1.5,
            fill: true,
            lineTension: 0.3,
            pointRadius: 0,
            data: []
        }]
    },
    options: {
        maintainAspectRatio: false,
        legend: { display: false },
        title: {
            display: true,
            text: 'Network',
            fontColor: 'rgba(255,255,255,0.7)',
            fontSize: 12,
            padding: 6,
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
                ticks: { display: false },
                gridLines: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            }],
            yAxes: [{
                scaleLabel: { display: false },
                ticks: {
                    beginAtZero: true,
                    fontColor: 'rgba(255,255,255,0.3)',
                    fontSize: 9,
                    maxTicksLimit: 5,
                },
                gridLines: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            }]
        },
    }
};

function onRefresh(chart) {
    var data = [];
    switch (chart) {
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
            data[0] = memTotal > 0 ? ((memTotal - memFree) * 100 / memTotal) : 0;
            break;
    }

    var i = 0;
    chart.config.data.datasets.forEach(function (dataset) {
        dataset.data.push({
            x: Date.now(),
            y: data[i],
        });
        i++;
    });
}

var cpuChart, gpuChart, netChart, ramChart;

function initChart() {
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

    isChartInit = true;
}

// =====================================================
// Lively Wallpaper callback — real system data
// =====================================================
function livelySystemInformation(data) {
    livelyConnected = true;

    var obj = JSON.parse(data);

    // Hardware names
    cpuName = obj.NameCpu || "CPU";
    gpuName = obj.NameGpu || "GPU";
    netCardName = obj.NameNetCard || "Network";
    memoryName = "RAM (" + (obj.TotalRam / 1024).toFixed(0) + " GB)";

    // Chart data
    cpuCounter = obj.CurrentCpu || 0;
    gpuCounter = obj.CurrentGpu3D || 0;
    netDownCounter = (obj.CurrentNetDown * 8) / (1024 * 1024);
    netUpCounter = (obj.CurrentNetUp * 8) / (1024 * 1024);
    memFree = obj.CurrentRamAvail || 0;
    memTotal = obj.TotalRam || 1;

    // Update chart titles with real hardware names
    if (cpuChart) cpuChart.options.title.text = cpuName;
    if (gpuChart) gpuChart.options.title.text = gpuName;
    if (netChart) netChart.options.title.text = netCardName;
    if (ramChart) ramChart.options.title.text = memoryName;
}

// =====================================================
// SIMULATION MODE — fallback when loaded via URL
// (livelySystemInformation is never called)
// =====================================================
var simInterval = null;

function startSimulation() {
    if (simInterval) return; // already running

    var simCpuBase = 15 + Math.random() * 25;
    var simGpuBase = 5 + Math.random() * 15;
    var simRamUsed = 40 + Math.random() * 25;
    var simNetDownBase = 0;
    var simNetUpBase = 0;

    simInterval = setInterval(function () {
        if (livelyConnected) {
            // Real data is flowing — stop simulation
            clearInterval(simInterval);
            simInterval = null;
            return;
        }

        // Simulate realistic-looking data with random walks
        simCpuBase += (Math.random() - 0.48) * 8;
        simCpuBase = Math.max(5, Math.min(95, simCpuBase));
        cpuCounter = Math.round(simCpuBase);

        simGpuBase += (Math.random() - 0.48) * 6;
        simGpuBase = Math.max(2, Math.min(90, simGpuBase));
        gpuCounter = Math.round(simGpuBase);

        simRamUsed += (Math.random() - 0.5) * 3;
        simRamUsed = Math.max(30, Math.min(85, simRamUsed));
        memTotal = 16384; // 16 GB simulated
        memFree = memTotal * (1 - simRamUsed / 100);

        // Network — occasional spikes
        if (Math.random() < 0.15) {
            simNetDownBase = 5 + Math.random() * 50;
            simNetUpBase = 2 + Math.random() * 15;
        } else {
            simNetDownBase *= 0.85;
            simNetUpBase *= 0.85;
            if (simNetDownBase < 0.5) simNetDownBase = Math.random() * 2;
            if (simNetUpBase < 0.3) simNetUpBase = Math.random() * 1;
        }
        netDownCounter = simNetDownBase;
        netUpCounter = simNetUpBase;
    }, 1000);
}

// =====================================================
// INIT — Start charts immediately
// =====================================================
initChart();

// If livelySystemInformation is not called within 3 seconds,
// start simulation mode (for URL/GitHub Pages usage)
setTimeout(function () {
    if (!livelyConnected) {
        startSimulation();
    }
}, 3000);


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
                document.getElementById('weatherDesc').textContent = 'Ошибка: ' + (data.message || '');
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
        rays += '<div class="sun-ray" style="transform:rotate(' + (i * 30) + 'deg) translateY(-42px)"></div>';
    }
    return '<div class="weather-icon-sunny"><div class="sun-core"></div>' + rays + '</div>';
}

function renderNightIcon() {
    return '<div class="weather-icon-sunny" style="filter:hue-rotate(200deg) brightness(0.6)">' +
        '<div class="sun-core" style="background:radial-gradient(circle,#c8d8f0,#8a9cc0);box-shadow:0 0 20px rgba(150,170,220,0.3)"></div>' +
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
        drops += '<div class="raindrop" style="left:' + p.left + 'px;top:50px;height:' + p.height + 'px;animation-duration:0.7s;animation-delay:' + p.delay + 's"></div>';
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
        flakes += '<div class="snowflake" style="left:' + p.left + 'px;top:50px;font-size:' + p.size + 'px;animation-duration:2.5s;animation-delay:' + p.delay + 's">*</div>';
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
        drops += '<div class="raindrop" style="left:' + p.left + 'px;top:65px;height:' + p.height + 'px;animation-duration:0.5s;animation-delay:' + p.delay + 's"></div>';
    }
    return '<div class="weather-icon-stormy"><div class="cloud cloud-main"></div>' +
        '<div class="lightning-bolt"><svg viewBox="0 0 30 50" fill="none"><polygon points="18,0 8,22 15,22 10,50 25,18 17,18 22,0" fill="#FFD93D" opacity="0.9"/></svg></div>' +
        drops + '</div>';
}

function renderMistIcon() {
    var lines = '';
    var configs = [
        { top: 30, left: 8, width: 74, delay: 0 },
        { top: 40, left: 14, width: 60, delay: 1.5 },
        { top: 50, left: 4, width: 82, delay: 3 },
        { top: 60, left: 18, width: 54, delay: 4.5 },
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
