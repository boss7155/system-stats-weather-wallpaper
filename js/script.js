// =====================================================
// SYSTEM STATS + WEATHER WALLPAPER
// =====================================================

// ===== КОНФИГУРАЦИЯ =====
var CONFIG = {
    weatherApiKey: 'YOUR_OPENWEATHERMAP_API_KEY', // Get free key at https://openweathermap.org/api
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
            changeBackground(weatherType);
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
// DYNAMIC WEATHER BACKGROUND
// =====================================================

var currentBgType = '';
var nightModeActive = false; // time-based night override (22:30–6:00)

// ===== TIME-BASED NIGHT MODE (22:30 – 6:00 by timezone) =====
function isNightTime() {
    var now = new Date();
    // Get local time in the configured timezone (Europe/Minsk)
    var localStr = now.toLocaleString('en-US', { timeZone: CONFIG.timezone });
    var localDate = new Date(localStr);
    var hours = localDate.getHours();
    var minutes = localDate.getMinutes();
    var totalMin = hours * 60 + minutes;

    // Night from 22:30 (22*60+30=1350) to 6:00 (6*60=360)
    return totalMin >= 1350 || totalMin < 360;
}

function checkNightMode() {
    var wasNight = nightModeActive;
    nightModeActive = isNightTime();

    if (nightModeActive !== wasNight) {
        // Night mode changed — force background update
        applyBackground();
    }
}

// Combined background logic: night time overrides weather-based background
function applyBackground() {
    if (nightModeActive) {
        // Force night background regardless of weather
        doChangeBackground('night-time', 'textures/night.jpg', 'rgba(0,0,20,0.45)');
    } else {
        // Use weather-based background
        var bgMap = {
            'clear': 'textures/sunny.jpg',
            'clear-night': 'textures/night.jpg',
            'partly-cloudy': 'textures/partly-cloudy.jpg',
            'cloudy': 'textures/overcast.jpg',
            'rain': 'textures/rain.jpg',
            'snow': 'textures/snow.jpg',
            'storm': 'textures/storm.jpg',
            'mist': 'textures/overcast.jpg',
        };
        var bgUrl = bgMap[currentBgType] || bgMap['clear'];

        var overlayColor;
        if (currentBgType === 'clear') {
            overlayColor = 'rgba(0,0,0,0.3)';
        } else if (currentBgType === 'partly-cloudy') {
            overlayColor = 'rgba(0,0,0,0.2)';
        } else if (currentBgType === 'clear-night') {
            overlayColor = 'rgba(0,0,20,0.3)';
        } else if (currentBgType === 'storm') {
            overlayColor = 'rgba(0,0,0,0.35)';
        } else if (currentBgType === 'cloudy' || currentBgType === 'mist') {
            overlayColor = 'rgba(0,0,0,0.25)';
        } else {
            overlayColor = 'rgba(0,0,0,0.15)';
        }
        doChangeBackground(currentBgType, bgUrl, overlayColor);
    }
}

function changeBackground(weatherType) {
    currentBgType = weatherType;
    applyBackground();
}

// Core background crossfade logic
var lastAppliedType = '';
function doChangeBackground(type, bgUrl, overlayColor) {
    if (type === lastAppliedType) return; // skip if same
    lastAppliedType = type;

    // Fade transition: use two bg layers
    var bgCurrent = document.getElementById('bgCurrent');
    var bgNext = document.getElementById('bgNext');

    // Preload image, then crossfade
    var img = new Image();
    img.onload = function () {
        bgNext.style.backgroundImage = 'url(' + bgUrl + ')';
        bgNext.style.opacity = '1';

        // After transition, move next to current
        setTimeout(function () {
            bgCurrent.style.backgroundImage = 'url(' + bgUrl + ')';
            bgNext.style.opacity = '0';
        }, 1500);
    };
    img.src = bgUrl;

    var overlay = document.getElementById('bgOverlay');
    overlay.style.background = overlayColor;
}

// Check night mode every 30 seconds
setInterval(checkNightMode, 30000);
// Initial check
checkNightMode();


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
    // 12 rays — alternating long/short, inside rotating wrapper
    // Core stays still, rays rotate slowly
    for (var i = 0; i < 12; i++) {
        var isLong = (i % 2 === 0);
        var cls = isLong ? 'sun-ray' : 'sun-ray sun-ray-short';
        rays += '<div class="' + cls + '" style="transform:rotate(' + (i * 30) + 'deg)"></div>';
    }
    return '<div class="weather-icon-sunny">' +
        '<div class="sun-rays-wrap">' + rays + '</div>' +
        '<div class="sun-core"></div>' +
    '</div>';
}

function renderNightIcon() {
    // Moon — crescent with craters
    return '<div class="weather-icon-night">' +
        '<div class="moon">' +
            '<div class="moon-shadow"></div>' +
            '<div class="moon-crater crater-1"></div>' +
            '<div class="moon-crater crater-2"></div>' +
            '<div class="moon-crater crater-3"></div>' +
        '</div>' +
        '<div class="moon-glow"></div>' +
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


// =====================================================
// AUDIO VISUALIZER — Lively Wallpaper callback
// =====================================================

var vizCanvas = document.getElementById('audioVisualizer');
var vizCtx = vizCanvas ? vizCanvas.getContext('2d') : null;
var musicWidgetEl = document.getElementById('musicWidget');

var smoothBars = new Array(32).fill(0);
var peakBars = new Array(32).fill(0);   // Peak hold markers
var peakFall = new Array(32).fill(0);   // Peak fall speed
var audioHideTimeout = null;
var audioIsActive = false;

// Helper: hide the audio widget and clear track info
function hideAudioWidget() {
    audioIsActive = false;
    if (musicWidgetEl) musicWidgetEl.classList.remove('has-track');
    var trackTitleEl = document.getElementById('trackTitle');
    var trackArtistEl = document.getElementById('trackArtist');
    var trackInfoEl = document.getElementById('trackInfo');
    if (trackTitleEl) { trackTitleEl.textContent = ''; trackTitleEl.classList.remove('marquee'); }
    if (trackArtistEl) trackArtistEl.textContent = '';
    if (trackInfoEl) trackInfoEl.classList.remove('has-title');
}

// Called by Lively when --system-nowplaying is enabled
// Updates track title/artist text. Visibility controlled by livelyAudioListener.
function livelyCurrentTrack(data) {
    var obj = null;
    try { obj = JSON.parse(data); } catch (e) {}

    var trackTitleEl = document.getElementById('trackTitle');
    var trackArtistEl = document.getElementById('trackArtist');
    var trackInfoEl = document.getElementById('trackInfo');

    // If audio is not active, always hide track info
    if (!audioIsActive) {
        if (trackTitleEl) { trackTitleEl.textContent = ''; trackTitleEl.classList.remove('marquee'); }
        if (trackArtistEl) trackArtistEl.textContent = '';
        if (trackInfoEl) trackInfoEl.classList.remove('has-title');
        return;
    }

    if (obj == null) {
        if (trackTitleEl) { trackTitleEl.textContent = ''; trackTitleEl.classList.remove('marquee'); }
        if (trackArtistEl) trackArtistEl.textContent = '';
        if (trackInfoEl) trackInfoEl.classList.remove('has-title');
    } else {
        var title = obj.Title || '';
        var artist = obj.Artist || '';

        if (trackTitleEl && title) {
            trackTitleEl.textContent = title;
            if (title.length > 38) {
                trackTitleEl.classList.add('marquee');
            } else {
                trackTitleEl.classList.remove('marquee');
            }
            if (trackInfoEl) trackInfoEl.classList.add('has-title');
        } else if (trackTitleEl) {
            trackTitleEl.textContent = '';
            trackTitleEl.classList.remove('marquee');
            if (trackInfoEl) trackInfoEl.classList.remove('has-title');
        }

        if (trackArtistEl) {
            trackArtistEl.textContent = artist || '';
        }
    }
}

// Called by Lively when --audio is enabled
// audioArray: frequency values from Lively audio capture
function livelyAudioListener(audioArray) {
    if (!vizCtx || !musicWidgetEl) return;

    // Show widget — we're receiving audio data (means something is playing)
    audioIsActive = true;
    clearTimeout(audioHideTimeout);
    if (musicWidgetEl) musicWidgetEl.classList.add('has-track');

    // Auto-hide when Lively stops calling this (player closed/paused)
    audioHideTimeout = setTimeout(hideAudioWidget, 3000);

    var width = vizCanvas.width;
    var height = vizCanvas.height;
    var barCount = 32;
    var gap = 3;
    var barWidth = (width - gap * (barCount + 1)) / barCount;

    // Logarithmic frequency mapping — each bar covers a frequency band
    var freqData = new Array(barCount);
    for (var i = 0; i < barCount; i++) {
        var logStart = Math.floor(Math.pow(audioArray.length, i / barCount));
        var logEnd = Math.floor(Math.pow(audioArray.length, (i + 1) / barCount));
        logStart = Math.max(0, Math.min(logStart, audioArray.length - 1));
        logEnd = Math.max(logStart + 1, Math.min(logEnd, audioArray.length));

        var sum = 0;
        for (var j = logStart; j < logEnd; j++) {
            sum += audioArray[j] || 0;
        }
        var raw = sum / (logEnd - logStart);

        // Frequency-dependent boost: treble amplified to balance visual
        var freqBoost = 1.0 + (i / barCount) * 1.5;
        raw *= freqBoost;

        freqData[i] = raw;
    }

    // Per-band normalization (4 groups of 8) for local normalization
    for (var g = 0; g < 4; g++) {
        var groupMax = 1;
        for (var gi = g * 8; gi < (g + 1) * 8 && gi < barCount; gi++) {
            if (freqData[gi] > groupMax) groupMax = freqData[gi];
        }
        for (var gi = g * 8; gi < (g + 1) * 8 && gi < barCount; gi++) {
            var targetHeight = (freqData[gi] / groupMax) * height * 0.9;
            targetHeight = Math.max(0, targetHeight);

            // Each bar has slightly different attack/decay for organic feel
            var attackSpeed = 0.45 + Math.random() * 0.15;
            var decaySpeed = 0.15 + Math.random() * 0.1;
            var smoothing = (targetHeight > smoothBars[gi]) ? attackSpeed : decaySpeed;
            smoothBars[gi] += (targetHeight - smoothBars[gi]) * smoothing;

            // Peak hold: peak stays then slowly falls
            if (smoothBars[gi] > peakBars[gi]) {
                peakBars[gi] = smoothBars[gi];
                peakFall[gi] = 0;
            } else {
                peakFall[gi] += 0.08;
                peakBars[gi] -= peakFall[gi];
                if (peakBars[gi] < smoothBars[gi]) {
                    peakBars[gi] = smoothBars[gi];
                }
            }
        }
    }

    // Draw — bars from bottom up with peak markers
    vizCtx.clearRect(0, 0, width, height);

    var x = gap;
    for (var i = 0; i < barCount; i++) {
        var barHeight = smoothBars[i];
        var peakHeight = peakBars[i];

        // Draw peak marker
        if (peakHeight > 2) {
            var peakY = height - peakHeight;
            var t = i / (barCount - 1);
            var pr, pg, pb;
            if (t < 0.5) { var pp = t * 2; pr = Math.round(20 + pp * 10); pg = Math.round(120 + pp * 135); pb = 255; }
            else { var pp = (t - 0.5) * 2; pr = Math.round(30 + pp * 170); pg = Math.round(255 - pp * 155); pb = 255; }

            vizCtx.fillStyle = 'rgba(' + Math.min(255, pr + 80) + ',' + Math.min(255, pg + 60) + ',' + Math.min(255, pb + 30) + ',0.9)';
            vizCtx.fillRect(x, peakY - 2, barWidth, 2);
        }

        if (barHeight < 1) {
            x += barWidth + gap;
            continue;
        }

        // Bottom-aligned bar
        var y = height - barHeight;

        // Smooth color across bars: deep blue → cyan → purple
        var t = i / (barCount - 1);
        var r, g, b;
        if (t < 0.5) {
            var p = t * 2;
            r = Math.round(20 + p * 10);
            g = Math.round(120 + p * 135);
            b = 255;
        } else {
            var p = (t - 0.5) * 2;
            r = Math.round(30 + p * 170);
            g = Math.round(255 - p * 155);
            b = 255;
        }

        var alpha = 0.7 + (barHeight / height) * 0.3;

        // Vertical gradient: lighter at top
        var grad = vizCtx.createLinearGradient(x, y, x, height);
        grad.addColorStop(0, 'rgba(' + Math.min(255, r + 50) + ',' + Math.min(255, g + 40) + ',' + b + ',' + alpha.toFixed(2) + ')');
        grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.6).toFixed(2) + ')');
        vizCtx.fillStyle = grad;

        // Rounded bar (round only at top)
        var radius = Math.min(barWidth / 2, 3);
        vizCtx.beginPath();
        vizCtx.moveTo(x + radius, y);
        vizCtx.lineTo(x + barWidth - radius, y);
        vizCtx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        vizCtx.lineTo(x + barWidth, height);
        vizCtx.lineTo(x, height);
        vizCtx.lineTo(x, y + radius);
        vizCtx.quadraticCurveTo(x, y, x + radius, y);
        vizCtx.closePath();
        vizCtx.fill();

        x += barWidth + gap;
    }
}

// Smooth decay when audio stops
function vizDecayLoop() {
    if (musicWidgetEl && !musicWidgetEl.classList.contains('has-track')) {
        var hasBars = false;
        for (var i = 0; i < smoothBars.length; i++) {
            if (smoothBars[i] > 0.5) {
                smoothBars[i] *= 0.85;
                hasBars = true;
            } else {
                smoothBars[i] = 0;
            }
        }
        if (hasBars && vizCtx) {
            var width = vizCanvas.width;
            var height = vizCanvas.height;
            vizCtx.clearRect(0, 0, width, height);
            var barCount = 32;
            var gap = 3;
            var barWidth = (width - gap * (barCount + 1)) / barCount;
            var x = gap;
            for (var i = 0; i < barCount; i++) {
                peakFall[i] += 0.08;
                peakBars[i] -= peakFall[i];
                if (peakBars[i] < smoothBars[i]) peakBars[i] = smoothBars[i];

                var barHeight = smoothBars[i];
                var peakHeight = peakBars[i];
                if (peakHeight > 2) {
                    var peakY = height - peakHeight;
                    var t = i / (barCount - 1);
                    var pr, pg, pb;
                    if (t < 0.5) { var pp = t * 2; pr = Math.round(20 + pp * 10); pg = Math.round(120 + pp * 135); pb = 255; }
                    else { var pp = (t - 0.5) * 2; pr = Math.round(30 + pp * 170); pg = Math.round(255 - pp * 155); pb = 255; }
                    vizCtx.fillStyle = 'rgba(' + Math.min(255, pr + 80) + ',' + Math.min(255, pg + 60) + ',' + Math.min(255, pb + 30) + ',0.5)';
                    vizCtx.fillRect(x, peakY - 2, barWidth, 2);
                }
                if (barHeight < 1) { x += barWidth + gap; continue; }
                var y = height - barHeight;
                var t = i / (barCount - 1);
                var r, g, b;
                if (t < 0.5) { var p = t * 2; r = Math.round(20 + p * 10); g = Math.round(120 + p * 135); b = 255; }
                else { var p = (t - 0.5) * 2; r = Math.round(30 + p * 170); g = Math.round(255 - p * 155); b = 255; }
                var alpha = 0.4 + (barHeight / height) * 0.2;
                var grad = vizCtx.createLinearGradient(x, y, x, height);
                grad.addColorStop(0, 'rgba(' + Math.min(255, r + 40) + ',' + Math.min(255, g + 30) + ',' + b + ',' + alpha.toFixed(2) + ')');
                grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.5).toFixed(2) + ')');
                vizCtx.fillStyle = grad;
                var radius = Math.min(barWidth / 2, 3);
                vizCtx.beginPath();
                vizCtx.moveTo(x + radius, y);
                vizCtx.lineTo(x + barWidth - radius, y);
                vizCtx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
                vizCtx.lineTo(x + barWidth, height);
                vizCtx.lineTo(x, height);
                vizCtx.lineTo(x, y + radius);
                vizCtx.quadraticCurveTo(x, y, x + radius, y);
                vizCtx.closePath();
                vizCtx.fill();
                x += barWidth + gap;
            }
        } else if (vizCtx) {
            vizCtx.clearRect(0, 0, vizCanvas.width, vizCanvas.height);
        }
    }
    requestAnimationFrame(vizDecayLoop);
}
requestAnimationFrame(vizDecayLoop);
