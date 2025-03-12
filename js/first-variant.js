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

document.getElementById("btnD").addEventListener("click", function () {
    toggleActiveMode("btnD");
    drawPieChart();
    drawColumnChart();
    setRandomTime();
});

document.getElementById("btnW").addEventListener("click", function () {
    toggleActiveMode("btnW");
    drawPieChart();
    drawColumnChart();
    setRandomTime();
});

document.getElementById("btnM").addEventListener("click", function () {
    toggleActiveMode("btnM");
    drawPieChart();
    drawColumnChart();
    setRandomTime();
});

function setRandomTime() {
    const start = 4 * 60 + 12;
    const end = 6 * 60 + 45;
    const randomSeconds = Math.floor(Math.random() * (end - start + 1)) + start;
    
    const minutes = Math.floor(randomSeconds / 60);
    const seconds = randomSeconds % 60;
    
    const time = `00:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('time-title').textContent = time;
}

setRandomTime();

google.charts.load('current', { 'packages': ['corechart', 'geochart'] });

google.charts.setOnLoadCallback(drawCharts);

function drawCharts() {
    drawPieChart();
    drawLineChart();
    drawColumnChart();
    drawGeoChart();
}

function drawPieChart() {
    var mobileValue = Math.random() * (0.94 - 0.81) + 0.81;
    mobileValue = Math.round(mobileValue * 100);
    mobileValue = Math.min(Math.max(mobileValue, 81), 94);
    mobileValue = mobileValue / 100;

    var desktopValue = 1 - mobileValue;

    desktopValue = Math.round(desktopValue * 100) / 100;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Device');
    data.addColumn('number', 'Popularity');
    data.addRows([
        ['Desktop', desktopValue],
        ['Mobile', mobileValue]
    ]);

    var options = {
        colors: ['#6a98f6', '#3366cc'],
        tooltip: {
            textStyle: {
                fontSize: 14
            }
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
    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}

function drawLineChart() {
    var data = google.visualization.arrayToDataTable([
        ['Time', 'Visits', { type: 'string', role: 'tooltip' }],
        [1, 60000, '60,000 in 1 hour'],
        [2, 60000, '60,000 in 2 hours'],
        [3, 60000, '60,000 in 3 hours'],
        [4, 60000, '60,000 in 4 hours'],
        [5, 60000, '60,000 in 5 hours'],
        [6, 60000, '60,000 in 6 hours']
    ]);

    var options = {
        curveType: 'function',
        legend: { position: "none", numberFormat: '0%' },
        tooltip: {
            trigger: 'both',
            textStyle: {
                fontSize: 14
            }
        },
        hAxis: {
            minValue: 0,
            maxValue: 10,
            textStyle: {
                fontSize: 10
            }
        },
        vAxis: {
            minValue: 0,
            maxValue: 100000,
            format: '###,###',
            textStyle: {
                fontSize: 10
            }
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}

function drawColumnChart() {
    var displayAdsValue = Math.random() * (0.87 - 0.75) + 0.75;
    var paidValue = 1 - displayAdsValue;

    var data = google.visualization.arrayToDataTable([
        ['Channels', 'Percentage', { role: 'style' }],
        ['DisplayAds', displayAdsValue, '#6a98f6'],
        ['Paid', paidValue, '#3366cc']
    ]);

    var formatter = new google.visualization.NumberFormat({ pattern: '0%' });
    formatter.format(data, 1);

    var options = {
        tooltip: {
            textStyle: {
                fontSize: 14
            }
        },
        vAxis: {
            minValue: 0, maxValue: 1, format: '0%',
            textStyle: {
                fontSize: 12
            }
        },
        bar: { groupWidth: "95%" },
        legend: { position: "none" },
        colors: ['#6a98f6', '#3366cc'],
        hAxis: {
            textStyle: {
                fontSize: 12
            }
        }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('columnchart_values'));
    chart.draw(data, options);
}

function drawGeoChart() {
    var data = google.visualization.arrayToDataTable([
        ['Country', 'Percentage'],
        ['France', 0.28],
        ['Spain', 0.25],
        ['United Kingdom', 0.08],
        ['Australia', 0.05],
        ['Mexico', 0.05]
    ]);

    var formatter = new google.visualization.NumberFormat({ pattern: '0%' });
    formatter.format(data, 1);

    var options = {
        region: 'world',
        colorAxis: { minValue: 0, maxValue: 1, colors: ['#e0f7fa', '#3366cc'] },
        legend: { numberFormat: '0%', textStyle: { fontSize: 14 } },
        tooltip: {
            isHtml: true, trigger: 'focus', textStyle: {
                fontSize: 14
            }
        }
    };

    var chart = new google.visualization.GeoChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}