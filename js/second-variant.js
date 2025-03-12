document.getElementById("pop-up-link").addEventListener("click", function () {
    document.getElementById("pop-up-block").style.opacity="1";
    document.getElementById("pop-up-block").style.visibility="visible";
    document.body.style.overflowY="hidden";
});

document.getElementById("close-icon").addEventListener("click", function () {
    document.getElementById("pop-up-block").style.opacity="0";
    document.getElementById("pop-up-block").style.visibility="hidden";
    document.body.style.overflowY="auto";
});

function toggleActiveMode(buttonId) {
    var buttons = document.querySelectorAll(".btn-custom-mode, .btn-custom");
    buttons.forEach(function (btn) {
        btn.classList.remove("active");
    });
    document.getElementById(buttonId).classList.add("active");
}

google.charts.load('current', { 'packages': ['corechart', 'geochart', 'line'] });

let lineData = [];

function generateLineChartData() {
    if (localStorage.getItem('lineData')) {
        lineData = JSON.parse(localStorage.getItem('lineData'));
    } else {
        lineData.push([new Date(), Math.floor(Math.random() * 101) + 50]);
        localStorage.setItem('lineData', JSON.stringify(lineData));
    }
}

function drawLineChart() {
    let lineChart = new google.visualization.LineChart(document.getElementById('line_chart'));
    lineChart.draw(google.visualization.arrayToDataTable([['Time', 'Visits'], ...lineData]), {
        curveType: 'function',
        legend: { position: 'none' },
        tooltip: { trigger: 'none' },
        hAxis: {
            title: '',
            textPosition: 'none'
        },
        vAxis: {
            title: '',
            minValue: 50,
            maxValue: 150,
            textPosition: 'none'
        }
    });
}

function updateLineChartData() {
    setInterval(() => {
        const currentTime = new Date();
        const newValue = Math.floor(Math.random() * 101) + 50;
        lineData.push([currentTime, newValue]);
        if (lineData.length >= 24) {
            lineData = [[new Date(), newValue]];
        }
        localStorage.setItem('lineData', JSON.stringify(lineData));
        drawLineChart();
        setRandomTime();
    }, 60000 );
}

function generateRandomDataForOtherCharts(type) {
    const data = [];
    switch (type) {
        case 'pie':
            const mobilePercentage = Math.floor(Math.random() * (94 - 81 + 1)) + 81;
            const desktopPercentage = 100 - mobilePercentage;
            data.push(['Device', 'Percentage']);
            data.push(['Mobile', mobilePercentage]);
            data.push(['Desktop', desktopPercentage]);
            break;
        case 'column':
            const displayAdsPercentage = Math.floor(Math.random() * (87 - 75 + 1)) + 75;
            const paidPercentage = 100 - displayAdsPercentage;
            data.push(['Category', 'Percentage']);
            data.push(['DisplayAds', displayAdsPercentage]);
            data.push(['Paid', paidPercentage]);
            break;
        case 'geo':
            data.push(['Country', 'Percentage']);
            const countries = ['France', 'Spain', 'United Kingdom', 'Australia', 'Mexico'];
            let remainingValue = 100;
            countries.forEach((country, index) => {
                let randomValue = (index === countries.length - 1) ? remainingValue : Math.floor(Math.random() * (remainingValue - (countries.length - 1 - index))) + 1;
                remainingValue -= randomValue;
                data.push([country, randomValue]);
            });
            break;
        default:
            break;
    }
    return data;
}

function saveDataToLocalStorage() {
    const pieData = generateRandomDataForOtherCharts('pie');
    const geoData = generateRandomDataForOtherCharts('geo');
    const columnData = generateRandomDataForOtherCharts('column');
    localStorage.setItem('pieData', JSON.stringify(pieData));
    localStorage.setItem('geoData', JSON.stringify(geoData));
    localStorage.setItem('columnData', JSON.stringify(columnData));
}

function loadDataFromLocalStorage() {
    const pieData = JSON.parse(localStorage.getItem('pieData'));
    const geoData = JSON.parse(localStorage.getItem('geoData'));
    const columnData = JSON.parse(localStorage.getItem('columnData'));

    if (!pieData || !geoData || !columnData) {
        saveDataToLocalStorage();
    }

    return {
        pieData: pieData || generateRandomDataForOtherCharts('pie'),
        geoData: geoData || generateRandomDataForOtherCharts('geo'),
        columnData: columnData || generateRandomDataForOtherCharts('column')
    };
}

function drawCharts() {
    const { pieData, geoData, columnData } = loadDataFromLocalStorage();
    const pieChartData = google.visualization.arrayToDataTable(pieData);
    const pieChart = new google.visualization.PieChart(document.getElementById('piechart'));
    pieChart.draw(pieChartData, {
        colors: ['#6a98f6', '#3366cc'],
        tooltip: {
            textStyle: {
                fontSize: 14
            },
            trigger: 'focus'
        },
        pieSliceTextStyle: {
            fontSize: 14
        },
        legend: {
            position: 'bottom',
            textStyle: {
                fontSize: 12,
                color: 'black'
            }
        }
    });

    const geoChartData = google.visualization.arrayToDataTable(geoData);
    const geoChart = new google.visualization.GeoChart(document.getElementById('geochart'));
    geoChart.draw(geoChartData, {
        colorAxis: { minValue: 0, maxValue: 100, colors: ['#cfddfa', '#3366cc'] },
        legend: { textStyle: { fontSize: 14 } },
        tooltip: {
            trigger: 'focus',
            textStyle: {
                fontSize: 14
            }
        }
    });

    const columnChartData = google.visualization.arrayToDataTable(columnData);
    const columnChart = new google.visualization.ColumnChart(document.getElementById('columnchart'));
    columnChart.draw(columnChartData, {
        colors: ['#6a98f6', '#3366cc'],
        tooltip: {
            textStyle: {
                fontSize: 14
            },
            trigger: 'focus'
        },
        legend: {
            position: 'none',
        },
        hAxis: {
            title: '',
            textStyle: {
                fontSize: 12
            }
        },
        vAxis: {
            title: '',
            format: '#\'%\'',
            viewWindow: {
                min: 0,
                max: 100
            },
            textStyle: {
                fontSize: 12
            }
        }
    });
}

function updateLegendTable() {
    const geoData = JSON.parse(localStorage.getItem('geoData'));

    const legendDiv = document.getElementById('legend_div');
    legendDiv.innerHTML = '';

    geoData.forEach((item) => {
        if (item[0] !== 'Country') {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';

            const countryDiv = document.createElement('div');
            countryDiv.className = 'legend-country';
            countryDiv.textContent = item[0];

            const percentageDiv = document.createElement('div');
            percentageDiv.className = 'legend-percentage';
            percentageDiv.textContent = `${item[1]}%`;

            legendItem.appendChild(countryDiv);
            legendItem.appendChild(percentageDiv);
            legendDiv.appendChild(legendItem);
        }
    });
}

function setRandomTime() {
    const start = 4 * 60 + 12;
    const end = 6 * 60 + 45;
    const randomSeconds = Math.floor(Math.random() * (end - start + 1)) + start;

    const minutes = Math.floor(randomSeconds / 60);
    const seconds = randomSeconds % 60;

    const time = `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('time-title').textContent = time;

    localStorage.setItem('randomTime', time);
}

function checkAndSetRandomTime() {
    const lastSetTime = localStorage.getItem('lastSetTime');
    const currentTime = new Date().getTime();
    if (!lastSetTime || currentTime - lastSetTime >= 60000 ) {
        setRandomTime();
        localStorage.setItem('lastSetTime', currentTime);
    }
}

function loadSavedRandomTime() {
    const savedTime = localStorage.getItem('randomTime');
    if (savedTime) {
        document.getElementById('time-title').textContent = savedTime;
    }
}

setInterval(() => {
    saveDataToLocalStorage();
    drawCharts();
    updateLegendTable();
    checkAndSetRandomTime();
}, 60000 );

google.charts.setOnLoadCallback(() => {
    generateLineChartData();
    drawLineChart();
    updateLineChartData();
    drawCharts();
    updateLegendTable();
    loadSavedRandomTime();
    checkAndSetRandomTime();
});
