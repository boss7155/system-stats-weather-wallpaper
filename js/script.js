// =====================================================
// SYSTEM STATS + WEATHER WALLPAPER
// =====================================================

// Global error handler — prevents uncaught exceptions from crashing WebView2
window.onerror = function(msg, url, line, col, error) {
    console.log('[ERROR]', msg, 'at', line + ':' + col);
    return true; // suppress error, don't crash
};
window.addEventListener('unhandledrejection', function(e) {
    console.log('[PROMISE ERROR]', e.reason);
    e.preventDefault();
});

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

    var obj = null;
    try { obj = JSON.parse(data); } catch (e) { return; }
    if (!obj) return;

    // Hardware names
    cpuName = obj.NameCpu || "CPU";
    gpuName = obj.NameGpu || "GPU";
    netCardName = obj.NameNetCard || "Network";
    memoryName = "RAM (" + ((obj.TotalRam || 1024) / 1024).toFixed(0) + " GB)";

    // Chart data
    cpuCounter = obj.CurrentCpu || 0;
    gpuCounter = obj.CurrentGpu3D || 0;
    netDownCounter = ((obj.CurrentNetDown || 0) * 8) / (1024 * 1024);
    netUpCounter = ((obj.CurrentNetUp || 0) * 8) / (1024 * 1024);
    memFree = obj.CurrentRamAvail || 0;
    memTotal = obj.TotalRam || 1;

    // Update chart titles with real hardware names
    try {
        if (cpuChart) cpuChart.options.title.text = cpuName;
        if (gpuChart) gpuChart.options.title.text = gpuName;
        if (netChart) netChart.options.title.text = netCardName;
        if (ramChart) ramChart.options.title.text = memoryName;
    } catch (e) {}
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

            // Adjust description for time of day
            var isNightIcon = iconCode.endsWith('n');
            if (isNightIcon || nightModeActive) {
                // Night-time description adjustments
                var nightMap = {
                    'ясно': 'Ясная ночь',
                    'небольшая облачность': 'Небольшая облачность',
                    'облачно': 'Облачная ночь',
                    'пасмурно': 'Пасмурная ночь',
                    'переменная облачность': 'Переменная облачность',
                    'небольшой дождь': 'Небольшой дождь',
                    'дождь': 'Дождь',
                    'гроза': 'Гроза',
                    'снег': 'Снег',
                    'туман': 'Туманная ночь',
                    'дымка': 'Дымка',
                };
                var mapped = nightMap[desc.toLowerCase()];
                if (mapped) desc = mapped;
            }
            desc = desc.charAt(0).toUpperCase() + desc.slice(1);

            document.getElementById('weatherTemp').textContent = temp + '°';
            document.getElementById('weatherDesc').textContent = desc;
            document.getElementById('weatherCity').textContent = city;

            // Check ALL weather conditions — API may list clouds first, rain second
            var weatherType = 'clear';
            var highestPriority = 0;
            for (var i = 0; i < data.weather.length; i++) {
                var wId = data.weather[i].id;
                var wIcon = data.weather[i].icon;
                var wType = mapWeatherIcon(wIcon, wId);
                var priority = getWeatherPriority(wType);
                if (priority > highestPriority) {
                    highestPriority = priority;
                    weatherType = wType;
                }
            }

            // === PRECIPITATION OVERRIDE ===
            // API often reports "clouds" (802) even when it's actually raining.
            // Check rain/snow precipitation data — if there's actual rainfall, force rain.
            if (data.rain) {
                var rainVol = (data.rain['1h'] || 0) + (data.rain['3h'] || 0);
                if (rainVol > 0 && getWeatherPriority(weatherType) < getWeatherPriority('rain')) {
                    console.log('[Weather] PRECIPITATION OVERRIDE: rain volume', rainVol, 'mm, forcing rain icon');
                    weatherType = 'rain';
                }
            }
            if (data.snow) {
                var snowVol = (data.snow['1h'] || 0) + (data.snow['3h'] || 0);
                if (snowVol > 0 && getWeatherPriority(weatherType) < getWeatherPriority('snow')) {
                    console.log('[Weather] PRECIPITATION OVERRIDE: snow volume', snowVol, 'mm, forcing snow icon');
                    weatherType = 'snow';
                }
            }

            // === DESCRIPTION KEYWORD OVERRIDE ===
            // Sometimes API doesn't include rain in weather[] but description says "дождь"
            var allDescs = '';
            for (var i = 0; i < data.weather.length; i++) {
                allDescs += (data.weather[i].description || '').toLowerCase() + ' ';
            }
            // Rain keywords in Russian
            if (allDescs.match(/дождь|ливень|дожд|морось|гроза|проливной/)) {
                if (allDescs.match(/гроза/)) {
                    if (getWeatherPriority(weatherType) < getWeatherPriority('storm')) {
                        console.log('[Weather] KEYWORD OVERRIDE: description contains "гроза", forcing storm');
                        weatherType = 'storm';
                    }
                } else if (getWeatherPriority(weatherType) < getWeatherPriority('rain')) {
                    console.log('[Weather] KEYWORD OVERRIDE: description contains rain keyword, forcing rain');
                    weatherType = 'rain';
                }
            }
            // Snow keywords
            if (allDescs.match(/снег|снегопад|метель|крупа|хлопья/)) {
                if (getWeatherPriority(weatherType) < getWeatherPriority('snow')) {
                    console.log('[Weather] KEYWORD OVERRIDE: description contains snow keyword, forcing snow');
                    weatherType = 'snow';
                }
            }

            // === API ICON CODE OVERRIDE ===
            // OpenWeatherMap icon codes: 09=drizzle, 10=rain, 11=storm, 13=snow
            // If ANY weather item has a rain/storm/snow icon code, force that type
            // This catches cases where API returns id 802 but icon says "10d" (rain)
            for (var i = 0; i < data.weather.length; i++) {
                var icon = data.weather[i].icon || '';
                if (icon.match(/^09/) && getWeatherPriority(weatherType) < getWeatherPriority('rain')) {
                    console.log('[Weather] ICON OVERRIDE: icon', icon, '→ rain');
                    weatherType = 'rain';
                }
                if (icon.match(/^10/) && getWeatherPriority(weatherType) < getWeatherPriority('rain')) {
                    console.log('[Weather] ICON OVERRIDE: icon', icon, '→ rain');
                    weatherType = 'rain';
                }
                if (icon.match(/^11/) && getWeatherPriority(weatherType) < getWeatherPriority('storm')) {
                    console.log('[Weather] ICON OVERRIDE: icon', icon, '→ storm');
                    weatherType = 'storm';
                }
                if (icon.match(/^13/) && getWeatherPriority(weatherType) < getWeatherPriority('snow')) {
                    console.log('[Weather] ICON OVERRIDE: icon', icon, '→ snow');
                    weatherType = 'snow';
                }
            }

            // Time-mode conversion (clear→clear-night, etc.) is now handled by applyBackground()
            // using baseWeatherType + current time mode. Just pass the base type here.

            // Reset background cache so weather change always applies
            lastAppliedType = '';
            changeBackground(weatherType); // sets baseWeatherType, derives effective type
            // Use currentBgType (effective type with time mode applied) for icon
            renderWeatherIcon(currentBgType);

            // Debug: log what API returned and what we computed
            console.log('[Weather] API weather:', JSON.stringify(data.weather), 
                'rain:', JSON.stringify(data.rain || 'none'),
                'snow:', JSON.stringify(data.snow || 'none'),
                '→ weatherType:', weatherType, 
                '→ currentBgType:', currentBgType,
                'night:', nightModeActive, 'evening:', eveningModeActive);
        })
        .catch(function (err) {
            document.getElementById('weatherDesc').textContent = 'Нет связи';
        });
}

// Priority: more severe weather wins when API returns multiple conditions
// Night variants have same priority as day variants — background overlay handles darkness
// storm(8) > rain(7) > snow(6) > dust(5) > mist(4) > cloudy(3) > partly-cloudy(2) > clear(1)
function getWeatherPriority(type) {
    var priorities = {
        'storm': 8, 'rain': 7, 'snow': 6, 'dust': 5,
        'mist': 4, 'cloudy': 3, 'cloudy-night': 3, 'cloudy-evening': 3,
        'partly-cloudy': 2, 'partly-cloudy-night': 2, 'partly-cloudy-evening': 2,
        'clear': 1, 'clear-night': 1, 'clear-evening': 1
    };
    return priorities[type] || 0;
}

function mapWeatherIcon(iconCode, id) {
    var isNight = iconCode && iconCode.endsWith('n');

    if (id >= 200 && id < 300) return 'storm';
    if (id >= 300 && id < 400) return 'rain';
    if (id >= 500 && id < 600) { if (id === 511) return 'snow'; return 'rain'; }
    if (id >= 600 && id < 700) return 'snow';
    if (id >= 700 && id < 800) {
        if (id === 731 || id === 751 || id === 761 || id === 762) return 'dust';
        if (id === 771) return 'storm';
        if (id === 781) return 'storm';
        return 'mist';
    }
    if (id === 800) return isNight ? 'clear-night' : 'clear';
    if (id > 800) {
        if (id === 801 || id === 802) return isNight ? 'partly-cloudy-night' : 'partly-cloudy';
        return isNight ? 'cloudy-night' : 'cloudy';
    }
    return isNight ? 'clear-night' : 'clear';
}


// =====================================================
// DYNAMIC WEATHER BACKGROUND
// =====================================================

var currentBgType = '';
var baseWeatherType = 'clear'; // Base weather type WITHOUT time-of-day modifiers
var nightModeActive = false; // time-based night override (22:30–6:00)
var eveningModeActive = false; // time-based evening override (19:30–22:30)

// ===== TIME-BASED MODES =====
function getTimePeriod() {
    var now = new Date();
    var localStr = now.toLocaleString('en-US', { timeZone: CONFIG.timezone });
    var localDate = new Date(localStr);
    var hours = localDate.getHours();
    var minutes = localDate.getMinutes();
    var totalMin = hours * 60 + minutes;

    // Night: 23:00 (1380) – 7:00 (420)
    if (totalMin >= 1380 || totalMin < 420) return 'night';
    // Evening: 20:00 (1200) – 23:00 (1380)
    if (totalMin >= 1200 && totalMin < 1380) return 'evening';
    // Day: 7:00 – 20:00
    return 'day';
}

function checkTimeMode() {
    var wasNight = nightModeActive;
    var wasEvening = eveningModeActive;

    var period = getTimePeriod();
    nightModeActive = (period === 'night');
    eveningModeActive = (period === 'evening');

    // Always reapply background when time changes — overlay depends on time of day
    if (nightModeActive !== wasNight || eveningModeActive !== wasEvening) {
        lastAppliedType = '';  // Force doChangeBackground to apply new overlay
        applyBackground();
        // Update weather icon to match new time mode (sunny → moon, etc.)
        renderWeatherIcon(currentBgType);
    }
}

// Combined background logic: weather determines image, time determines overlay darkness
// baseWeatherType stores the raw weather type; effective type is derived from it + time mode.
// This ensures that when time mode changes (day→evening→night), the background updates
// immediately without waiting for the next weather API call.
function applyBackground() {
    // ===== Normalize base type: strip -night/-evening suffixes =====
    // mapWeatherIcon() returns variants like 'clear-night' based on API icon,
    // but time-mode conversion must use the BASE type. Strip suffixes so that
    // the CURRENT time mode (not the API icon) determines the effective type.
    var base = baseWeatherType.replace(/-night$/, '').replace(/-evening$/, '');

    // ===== Derive effective type from base weather + current time mode =====
    var effectiveType = base;
    if (nightModeActive) {
        if (effectiveType === 'clear') effectiveType = 'clear-night';
        else if (effectiveType === 'partly-cloudy') effectiveType = 'partly-cloudy-night';
        else if (effectiveType === 'cloudy') effectiveType = 'cloudy-night';
    } else if (eveningModeActive) {
        if (effectiveType === 'clear') effectiveType = 'clear-evening';
        else if (effectiveType === 'partly-cloudy') effectiveType = 'partly-cloudy-evening';
        else if (effectiveType === 'cloudy') effectiveType = 'cloudy-evening';
    }
    currentBgType = effectiveType;

    // ===== Map effective type to background image =====
    // Night/Evening: use night.jpg / evening.jpg for clear AND cloudy weather
    // (just clouds at night = night sky, clouds at evening = evening sky)
    // Only rain/storm/snow keep their specific textures at night/evening
    // (so you can SEE the rain/snow, not just dark sky)
    var bgMap = {
        'clear': 'textures/sunny.jpg',
        'clear-night': 'textures/night.jpg',
        'clear-evening': 'textures/evening.jpg',
        'partly-cloudy': 'textures/partly-cloudy.jpg',
        'partly-cloudy-night': 'textures/night.jpg',
        'partly-cloudy-evening': 'textures/evening.jpg',
        'cloudy': 'textures/overcast.jpg',
        'cloudy-night': 'textures/night.jpg',
        'cloudy-evening': 'textures/evening.jpg',
        'rain': 'textures/rain.jpg',
        'snow': 'textures/snow.jpg',
        'storm': 'textures/storm.jpg',
        'mist': 'textures/night.jpg',
        'dust': 'textures/overcast.jpg',
    };
    var bgUrl = bgMap[currentBgType] || bgMap['clear'];

    // ===== Determine overlay color based on BOTH weather type AND time of day =====
    var overlayColor;

    if (nightModeActive) {
        // Night: dark overlay on top of weather background
        if (currentBgType === 'rain' || currentBgType === 'storm') {
            overlayColor = 'rgba(0,0,20,0.4)';
        } else if (currentBgType === 'snow') {
            overlayColor = 'rgba(0,5,25,0.45)';
        } else if (currentBgType === 'cloudy-night' || currentBgType === 'mist' || currentBgType === 'dust') {
            overlayColor = 'rgba(0,0,15,0.5)';
        } else if (currentBgType === 'partly-cloudy-night') {
            overlayColor = 'rgba(0,0,20,0.5)';
        } else {
            // clear-night
            overlayColor = 'rgba(0,0,20,0.45)';
        }
    } else if (eveningModeActive) {
        // Evening: warm overlay on top of weather background
        if (currentBgType === 'rain' || currentBgType === 'storm') {
            overlayColor = 'rgba(10,5,20,0.35)';
        } else if (currentBgType === 'snow') {
            overlayColor = 'rgba(10,5,20,0.3)';
        } else if (currentBgType === 'cloudy-evening' || currentBgType === 'mist' || currentBgType === 'dust') {
            overlayColor = 'rgba(10,5,15,0.35)';
        } else if (currentBgType === 'partly-cloudy-evening') {
            overlayColor = 'rgba(10,5,20,0.25)';
        } else {
            // clear-evening (evening.jpg is already dark/warm, lighter overlay)
            overlayColor = 'rgba(10,5,20,0.2)';
        }
    } else {
        // Daytime: normal weather-based overlay
        if (currentBgType === 'clear') {
            overlayColor = 'rgba(0,0,0,0.3)';
        } else if (currentBgType === 'partly-cloudy') {
            overlayColor = 'rgba(0,0,0,0.2)';
        } else if (currentBgType === 'storm') {
            overlayColor = 'rgba(0,0,0,0.35)';
        } else if (currentBgType === 'cloudy' || currentBgType === 'mist' || currentBgType === 'dust') {
            overlayColor = 'rgba(0,0,0,0.25)';
        } else {
            overlayColor = 'rgba(0,0,0,0.15)';
        }
    }

    // Build a composite type that encodes both weather and time mode
    // This ensures doChangeBackground sees different types for "rain at night" vs "rain at day"
    var compositeType = currentBgType;
    if (nightModeActive) compositeType += ':night';
    else if (eveningModeActive) compositeType += ':evening';

    // No blur only for night backgrounds (clear-night, partly-cloudy-night, cloudy-night)
    // Evening backgrounds keep blur (evening.jpg looks better with subtle blur)
    var isNightBg = (currentBgType === 'clear-night' || currentBgType === 'partly-cloudy-night' || currentBgType === 'cloudy-night') && nightModeActive;

    doChangeBackground(compositeType, bgUrl, overlayColor, isNightBg);
}

function changeBackground(weatherType) {
    baseWeatherType = weatherType; // Store base type (without time modifiers)
    applyBackground(); // Derives effective type from baseWeatherType + time mode
}

// Core background crossfade logic
var lastAppliedType = '';
var bgTransitionTimer = null; // Track crossfade timers to prevent race conditions
function doChangeBackground(type, bgUrl, overlayColor, isNightBg) {
    console.log('[BG] doChangeBackground:', type, '→', bgUrl, 'lastApplied:', lastAppliedType, 'nightBg:', isNightBg);
    if (type === lastAppliedType) return; // skip if same
    lastAppliedType = type;

    // Toggle night-bg class on body — removes blur for night backgrounds
    if (isNightBg) {
        document.body.classList.add('night-bg');
    } else {
        document.body.classList.remove('night-bg');
    }

    // Fade transition: use two bg layers
    var bgCurrent = document.getElementById('bgCurrent');
    var bgNext = document.getElementById('bgNext');

    // Cancel any pending crossfade from previous call
    if (bgTransitionTimer) {
        clearTimeout(bgTransitionTimer);
        bgTransitionTimer = null;
    }

    // Preload image, then crossfade
    var img = new Image();
    img.onload = function () {
        bgNext.style.backgroundImage = 'url(' + bgUrl + ')';
        bgNext.style.opacity = '1';

        // After transition, move next to current
        bgTransitionTimer = setTimeout(function () {
            bgCurrent.style.backgroundImage = 'url(' + bgUrl + ')';
            bgNext.style.opacity = '0';
            bgTransitionTimer = null;
        }, 1500);
    };
    img.onerror = function () {
        // If image fails to load, apply directly to current layer
        console.log('[BG] Image load FAILED for:', bgUrl, '— applying directly');
        bgCurrent.style.backgroundImage = 'url(' + bgUrl + ')';
        bgNext.style.opacity = '0';
    };
    img.src = bgUrl;

    var overlay = document.getElementById('bgOverlay');
    overlay.style.background = overlayColor;

    // Update fullscreen weather effects (rain, snow, lightning)
    updateWeatherFx();
}

// Check time mode every 30 seconds
setInterval(checkTimeMode, 30000);
// Initial setup: determine time mode first, then apply background
checkTimeMode();
// Ensure baseWeatherType has a default value
if (!baseWeatherType) {
    baseWeatherType = 'clear'; // default until weather API responds
}
// Force initial background application — reset cache to ensure it applies
lastAppliedType = '';
applyBackground();


// =====================================================
// ANIMATED WEATHER ICONS
// =====================================================

function renderWeatherIcon(type) {
    var wrap = document.getElementById('weatherIconWrap');
    if (!wrap) return;
    switch (type) {
        case 'clear': wrap.innerHTML = renderSunnyIcon(); break;
        case 'clear-night': wrap.innerHTML = renderNightIcon(); break;
        case 'clear-evening': wrap.innerHTML = renderNightIcon(); break; // Moon at evening too
        case 'partly-cloudy': wrap.innerHTML = renderPartlyCloudyIcon(); break;
        case 'partly-cloudy-night': wrap.innerHTML = renderPartlyCloudyNightIcon(); break;
        case 'partly-cloudy-evening': wrap.innerHTML = renderPartlyCloudyNightIcon(); break;
        case 'cloudy': wrap.innerHTML = renderCloudyIcon(); break;
        case 'cloudy-night': wrap.innerHTML = renderCloudyNightIcon(); break;
        case 'cloudy-evening': wrap.innerHTML = renderCloudyNightIcon(); break;
        case 'rain': wrap.innerHTML = renderRainIcon(); break;
        case 'snow': wrap.innerHTML = renderSnowIcon(); break;
        case 'storm': wrap.innerHTML = renderStormIcon(); break;
        case 'mist': wrap.innerHTML = renderMistIcon(); break;
        case 'dust': wrap.innerHTML = renderDustIcon(); break;
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

// Night variant: moon + cloud instead of sun + cloud
function renderPartlyCloudyNightIcon() {
    return '<div class="weather-icon-partly-cloudy-night">' +
        '<div class="mini-moon">' +
            '<div class="mini-moon-body"></div>' +
            '<div class="mini-moon-shadow"></div>' +
        '</div>' +
        '<div class="cloud cloud-main"></div>' +
    '</div>';
}

// Night variant: darker clouds with subtle moon glow behind
function renderCloudyNightIcon() {
    return '<div class="weather-icon-cloudy-night">' +
        '<div class="moon-glow-behind"></div>' +
        '<div class="cloud cloud-back cloud-night"></div>' +
        '<div class="cloud cloud-main cloud-night"></div>' +
    '</div>';
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

function renderDustIcon() {
    var particles = '';
    var pConfigs = [
        { left: 12, top: 18, size: 6, delay: 0, dur: 2.0 },
        { left: 28, top: 30, size: 8, delay: 0.4, dur: 1.8 },
        { left: 48, top: 14, size: 5, delay: 0.8, dur: 2.2 },
        { left: 64, top: 26, size: 7, delay: 0.2, dur: 1.6 },
        { left: 20, top: 42, size: 9, delay: 1.0, dur: 2.4 },
        { left: 40, top: 50, size: 6, delay: 0.6, dur: 1.9 },
        { left: 58, top: 38, size: 7, delay: 1.2, dur: 2.1 },
        { left: 72, top: 48, size: 5, delay: 0.3, dur: 1.7 },
        { left: 35, top: 60, size: 8, delay: 0.9, dur: 2.3 },
        { left: 55, top: 64, size: 6, delay: 1.4, dur: 1.5 },
    ];
    for (var i = 0; i < pConfigs.length; i++) {
        var p = pConfigs[i];
        particles += '<div class="dust-particle" style="left:' + p.left + 'px;top:' + p.top + 'px;width:' + p.size + 'px;height:' + p.size + 'px;animation-duration:' + p.dur + 's;animation-delay:' + p.delay + 's"></div>';
    }
    // Wind lines sweeping across
    var windLines = '';
    var wConfigs = [
        { top: 22, left: 5, width: 55, delay: 0 },
        { top: 36, left: 15, width: 45, delay: 0.6 },
        { top: 50, left: 8, width: 60, delay: 1.2 },
        { top: 64, left: 20, width: 40, delay: 0.3 },
    ];
    for (var i = 0; i < wConfigs.length; i++) {
        var w = wConfigs[i];
        windLines += '<div class="dust-wind" style="top:' + w.top + 'px;left:' + w.left + 'px;width:' + w.width + 'px;animation-delay:' + w.delay + 's"></div>';
    }
    return '<div class="weather-icon-dust">' + windLines + particles + '</div>';
}


// =====================================================
// FULLSCREEN WEATHER EFFECTS — rain, snow, lightning
// =====================================================

var currentFxType = ''; // Track which effect is active to avoid redundant updates

function updateWeatherFx() {
    var fx = document.getElementById('weatherFx');
    if (!fx) return;

    // Determine which effect to show based on currentBgType
    var fxType = 'none';
    var base = currentBgType.replace(/-night$/, '').replace(/-evening$/, '');
    if (base === 'rain') fxType = 'rain';
    else if (base === 'storm') fxType = 'storm';
    else if (base === 'snow') fxType = 'snow';

    // Skip if same effect already active
    if (fxType === currentFxType) return;
    currentFxType = fxType;

    // Clear previous effects
    fx.innerHTML = '';

    if (fxType === 'rain') {
        // Generate 60 rain drops spread across the screen
        var html = '';
        for (var i = 0; i < 60; i++) {
            var left = Math.random() * 100;
            var height = 15 + Math.random() * 25; // 15-40px
            var duration = 0.6 + Math.random() * 0.5; // 0.6-1.1s
            var delay = Math.random() * 2;
            var opacity = 0.3 + Math.random() * 0.4;
            html += '<div class="fx-raindrop" style="left:' + left + '%;height:' + height + 'px;animation-duration:' + duration + 's;animation-delay:' + delay + 's;opacity:' + opacity + '"></div>';
        }
        fx.innerHTML = html;
    }
    else if (fxType === 'storm') {
        // Storm = rain + lightning
        var html = '';
        // More intense rain than regular rain
        for (var i = 0; i < 80; i++) {
            var left = Math.random() * 100;
            var height = 20 + Math.random() * 30; // 20-50px — longer drops
            var duration = 0.4 + Math.random() * 0.4; // 0.4-0.8s — faster
            var delay = Math.random() * 1.5;
            var opacity = 0.3 + Math.random() * 0.5;
            html += '<div class="fx-raindrop" style="left:' + left + '%;height:' + height + 'px;animation-duration:' + duration + 's;animation-delay:' + delay + 's;opacity:' + opacity + '"></div>';
        }
        // Two lightning layers with different timing for realistic double-flash
        html += '<div class="fx-lightning"></div>';
        html += '<div class="fx-lightning2"></div>';
        fx.innerHTML = html;
    }
    else if (fxType === 'snow') {
        // Generate 50 snowflakes
        var html = '';
        for (var i = 0; i < 50; i++) {
            var left = Math.random() * 100;
            var size = 3 + Math.random() * 6; // 3-9px
            var duration = 4 + Math.random() * 6; // 4-10s — slow drift
            var delay = Math.random() * 5;
            var opacity = 0.4 + Math.random() * 0.4;
            html += '<div class="fx-snowflake" style="left:' + left + '%;width:' + size + 'px;height:' + size + 'px;animation-duration:' + duration + 's;animation-delay:' + delay + 's;opacity:' + opacity + '"></div>';
        }
        fx.innerHTML = html;
    }
    // else: no effects (clear, cloudy, etc.)
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
var barAttack = new Array(32);  // Per-bar attack speed (fixed per bar, not random each frame)
var barDecay = new Array(32);   // Per-bar decay speed (fixed per bar)
var barLocalMax = new Array(32).fill(0.01); // Per-bar running local maximum (slow decay)
var audioHideTimeout = null;
var audioIsActive = false;
var lastTrackTitle = '';  // Cache track title for re-application
var lastTrackArtist = ''; // Cache track artist for re-application

// Initialize per-bar random attack/decay speeds (once, not every frame)
for (var _bi = 0; _bi < 32; _bi++) {
    barAttack[_bi] = 0.35 + (_bi % 5) * 0.06;  // 0.35..0.59 varied
    barDecay[_bi] = 0.12 + (_bi % 7) * 0.015;  // 0.12..0.21 varied
}

// Helper: hide the audio widget and clear track info
function hideAudioWidget() {
    audioIsActive = false;
    lastTrackTitle = '';
    lastTrackArtist = '';
    if (musicWidgetEl) musicWidgetEl.classList.remove('has-track');
    var trackTitleEl = document.getElementById('trackTitle');
    var trackArtistEl = document.getElementById('trackArtist');
    var trackInfoEl = document.getElementById('trackInfo');
    if (trackTitleEl) { trackTitleEl.textContent = ''; trackTitleEl.classList.remove('marquee'); }
    if (trackArtistEl) trackArtistEl.textContent = '';
    if (trackInfoEl) trackInfoEl.classList.remove('has-title');
}

// Helper: apply cached track data to DOM elements
function applyTrackInfo(title, artist) {
    var trackTitleEl = document.getElementById('trackTitle');
    var trackArtistEl = document.getElementById('trackArtist');
    var trackInfoEl = document.getElementById('trackInfo');

    if (trackTitleEl && title) {
        trackTitleEl.textContent = title;
        if (title.length > 38) {
            trackTitleEl.classList.add('marquee');
        } else {
            trackTitleEl.classList.remove('marquee');
        }
        if (trackInfoEl) trackInfoEl.classList.add('has-title');
    }
    if (trackArtistEl) {
        trackArtistEl.textContent = artist || '';
    }
}

// Called by Lively when --system-nowplaying is enabled
// IMPORTANT: livelyCurrentTrack fires BEFORE livelyAudioListener when a track starts.
// We must show the widget immediately upon receiving valid track data,
// without waiting for audioIsActive to be set by livelyAudioListener.
function livelyCurrentTrack(data) {
    var obj = null;
    try { obj = JSON.parse(data); } catch (e) {}

    if (obj != null && (obj.Title || obj.Artist)) {
        // Got valid track data — show it immediately
        var title = obj.Title || '';
        var artist = obj.Artist || '';
        lastTrackTitle = title;
        lastTrackArtist = artist;

        applyTrackInfo(title, artist);

        // Show the widget right now — we have track data
        audioIsActive = true;
        clearTimeout(audioHideTimeout);
        if (musicWidgetEl) musicWidgetEl.classList.add('has-track');

        // Set timeout: if livelyAudioListener doesn't confirm within 4 sec,
        // it means audio isn't actually playing — hide everything
        audioHideTimeout = setTimeout(hideAudioWidget, 4000);
    } else {
        // No track data (null) — player likely closed or stopped
        // Clear cached track data and hide immediately
        lastTrackTitle = '';
        lastTrackArtist = '';
        var trackTitleEl = document.getElementById('trackTitle');
        var trackArtistEl = document.getElementById('trackArtist');
        var trackInfoEl = document.getElementById('trackInfo');
        if (trackTitleEl) { trackTitleEl.textContent = ''; trackTitleEl.classList.remove('marquee'); }
        if (trackArtistEl) trackArtistEl.textContent = '';
        if (trackInfoEl) trackInfoEl.classList.remove('has-title');

        // Also hide the widget
        audioIsActive = false;
        clearTimeout(audioHideTimeout);
        if (musicWidgetEl) musicWidgetEl.classList.remove('has-track');
    }
}

// Called by Lively when --audio is enabled
// audioArray: frequency values from Lively audio capture
function livelyAudioListener(audioArray) {
    if (!vizCtx || !musicWidgetEl) return;
    if (!audioArray || !audioArray.length) return;

    // Audio is playing — show widget
    audioIsActive = true;
    clearTimeout(audioHideTimeout);
    if (musicWidgetEl) musicWidgetEl.classList.add('has-track');

    // Re-apply cached track info if it was cleared (safety net)
    if (lastTrackTitle) {
        applyTrackInfo(lastTrackTitle, lastTrackArtist);
    }

    // Auto-hide when Lively stops calling this (player closed/paused)
    audioHideTimeout = setTimeout(hideAudioWidget, 3000);

    var width = vizCanvas.width;
    var height = vizCanvas.height;
    var barCount = 32;
    var gap = 3;
    var barWidth = (width - gap * (barCount + 1)) / barCount;

    // === NEW FREQUENCY MAPPING ===
    // Split 128 frequency bins into 32 bars using weighted linear distribution
    // This gives equal visual weight to low/mid/high frequencies
    var freqData = new Array(barCount);
    var binCount = audioArray.length; // 128

    for (var i = 0; i < barCount; i++) {
        // Each bar gets ~4 bins, but with slight overlap for smoother result
        var centerBin = (i + 0.5) * binCount / barCount;
        var halfSpan = Math.max(2, Math.floor(binCount / barCount / 2) + 1);

        var binStart = Math.max(0, Math.floor(centerBin - halfSpan));
        var binEnd = Math.min(binCount, Math.floor(centerBin + halfSpan));

        // Weighted average — center bins contribute more
        var weightedSum = 0;
        var weightTotal = 0;
        for (var j = binStart; j < binEnd; j++) {
            var dist = Math.abs(j - centerBin) / (halfSpan + 1);
            var w = 1.0 - dist * 0.6;  // center weight 1.0, edge weight 0.4
            weightedSum += (audioArray[j] || 0) * w;
            weightTotal += w;
        }
        var raw = weightTotal > 0 ? weightedSum / weightTotal : 0;

        // Frequency-dependent sensitivity curve:
        // Bass (left): moderate boost, Mid: base, Treble (right): strong boost
        // This compensates for natural audio where bass dominates
        var freqNorm = i / (barCount - 1); // 0..1
        var sensitivity;
        if (freqNorm < 0.25) {
            sensitivity = 1.2;  // Bass — moderate
        } else if (freqNorm < 0.5) {
            sensitivity = 1.0;  // Low-mid — base
        } else if (freqNorm < 0.75) {
            sensitivity = 1.4;  // Upper-mid — boost
        } else {
            sensitivity = 1.8;  // Treble — strong boost
        }
        raw *= sensitivity;

        freqData[i] = raw;
    }

    // === PER-BAR LOCAL NORMALIZATION ===
    // Each bar tracks its own running maximum with slow decay.
    // This means bass bars respond to bass energy, treble bars respond to treble energy —
    // no frequency dominates the others.
    for (var i = 0; i < barCount; i++) {
        // Update this bar's local max: rise fast, fall very slowly
        if (freqData[i] > barLocalMax[i]) {
            barLocalMax[i] = freqData[i]; // instant rise
        } else {
            barLocalMax[i] *= 0.997; // very slow decay (~30 sec to halve)
            if (barLocalMax[i] < 0.01) barLocalMax[i] = 0.01;
        }

        // Normalize to THIS bar's own local max — always 0..1
        var normalized = freqData[i] / barLocalMax[i];

        // Apply slight per-bar curve for visual variety
        var curve = 0.7 + (i * 7 % 11) / 110;  // 0.7..0.8 — subtle
        normalized = Math.pow(normalized, curve);

        // Scale to pixel height
        var targetHeight = normalized * height * 0.9;
        targetHeight = Math.max(0, targetHeight);

        // Smooth each bar independently with its own fixed attack/decay
        var attack = barAttack[i];
        var decay = barDecay[i];
        var smoothing = (targetHeight > smoothBars[i]) ? attack : decay;
        smoothBars[i] += (targetHeight - smoothBars[i]) * smoothing;

        // Peak hold: peak stays then slowly falls
        if (smoothBars[i] > peakBars[i]) {
            peakBars[i] = smoothBars[i];
            peakFall[i] = 0;
        } else {
            peakFall[i] += 0.06;
            peakBars[i] -= peakFall[i];
            if (peakBars[i] < smoothBars[i]) {
                peakBars[i] = smoothBars[i];
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
