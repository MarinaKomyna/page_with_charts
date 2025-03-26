const pageElements = {
    popUpLink: document.getElementById("pop-up-link"),
    popUpBlock: document.getElementById("pop-up-block"),
    closeIcon: document.getElementById("close-icon"),
    totalVisits: document.getElementById("total-visits-number"),
    timeTitle: document.getElementById("time-title"),
    legendDiv: document.getElementById("legend-div"),
    lineChart: document.getElementById("line_chart"),
    pieChart: document.getElementById("piechart"),
    columnChart: document.getElementById("columnchart"),
    geoChart: document.getElementById("geochart")
};

async function fetchJsonData(jsonFile) {
    try {
        const response = await fetch(`https://MarinaKomyna.github.io/page_with_charts/json/${jsonFile}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${jsonFile}:`, error);
        throw error;
    }
}

pageElements.popUpLink.addEventListener("click", function () {
    pageElements.popUpBlock.style.opacity = "1";
    pageElements.popUpBlock.style.visibility = "visible";
    document.body.style.overflowY = "hidden";
});

pageElements.closeIcon.addEventListener("click", function () {
    pageElements.popUpBlock.style.opacity = "0";
    pageElements.popUpBlock.style.visibility = "hidden";
    document.body.style.overflowY = "auto";
});

const countryMapping = {
    'FR': 'France',
    'PL': 'Poland',
    'BA': 'Bosnia and Herzegovina',
    'UK': 'United Kingdom',
    'SE': 'Sweden',
    'DE': 'Germany',
    'FI': 'Finland',
    'RO': 'Romania',
    'ES': 'Spain',
    'SI': 'Slovenia',
    'BG': 'Bulgaria',
    'CH': 'Switzerland',
    'IE': 'Ireland',
    'GL': 'Greenland',
    'US': 'United States'
};

function getCountryName(countryCode) {
    return countryMapping[countryCode.toLowerCase()] || countryCode.toUpperCase();
}

function toggleActiveMode(buttonId) {
    document.querySelectorAll(".btn-custom-mode, .btn-custom")
        .forEach(btn => btn.classList.remove("active"));
    document.getElementById(buttonId).classList.add("active");
}

let currentJsonFile = 'day.json';

function handlePeriodChange(period, jsonFile) {
    return async function () {
        toggleActiveMode(`btn${period.charAt(0).toUpperCase()}`);
        currentJsonFile = jsonFile;
        await drawLineChart(period);
        await updateAllCharts();
        await setTimeOnSite();
    };
}

document.getElementById("btnD").addEventListener("click", handlePeriodChange('daily', 'day.json'));
document.getElementById("btnW").addEventListener("click", handlePeriodChange('weekly', 'week.json'));
document.getElementById("btnM").addEventListener("click", handlePeriodChange('monthly', 'month.json'));

google.charts.load('current', { 'packages': ['corechart', 'geochart', 'line'] });

const createTooltipColumn = (dataTable) => ({
    type: 'string',
    role: 'tooltip',
    properties: { html: true },
    calc: function (dt, row) {
        return `<div style="font-family: Arial, sans-serif; font-size: 14px; padding:5px">
            <b>${dt.getValue(row, 0)}</b> ${dt.getValue(row, 1)}%</div>`;
    }
});

async function drawLineChart(period) {
    try {
        const jsonData = await fetchJsonData(currentJsonFile);
        const data = [['Hour', 'Visits']];
        
        // Process data based on period
        jsonData.visitDuration.forEach(entry => {
            const label = period === 'daily' ? entry.hour :
                         `Day ${entry.day}, ${entry.hour}`;
            data.push([label, entry.visits]);
        });

        const periodConfig = {
            daily: {
                title: 'Hours (24h)',
                gridlines: 24
            },
            weekly: {
                title: 'Days (7d)',
                gridlines: 7
            },
            monthly: {
                title: 'Days (30d)',
                gridlines: 30
            }
        };

        const config = periodConfig[period] || periodConfig.daily;
        const chartData = google.visualization.arrayToDataTable(data);

        const view = new google.visualization.DataView(chartData);
        view.setColumns([0, 1, {
            type: 'string',
            role: 'tooltip',
            properties: { html: true },
            calc: (dt, row) => `<div style="padding:5px; font-family: Arial, sans-serif; font-size: 14px; width: 80px;">
                <b>${dt.getValue(row, 0)}</b></div>`
        }]);

        const options = {
            curveType: 'function',
            legend: { position: 'none' },
            tooltip: { isHtml: true },
            hAxis: {
                title: config.title,
                gridlines: {
                    count: config.gridlines,
                    color: '#f5f5f5'
                },
                baselineColor: '#ddd',
                textStyle: { fontSize: 12 }
            },
            vAxis: {
                title: 'Visits',
                viewWindow: { min: 0 },
                gridlines: { color: '#f5f5f5' },
                baselineColor: '#ddd',
                textStyle: { fontSize: 12 }
            },
            chartArea: { width: '90%', height: '80%' },
            colors: ['#3366cc'],
            lineWidth: 2
        };

        const chart = new google.visualization.LineChart(pageElements.lineChart);
        chart.draw(view, options);
    } catch (error) {
        console.error('Error in drawLineChart:', error);
    }
}

async function drawCharts() {
    try {
        const jsonData = await fetchJsonData(currentJsonFile);

        // Calculate total clicks
        const totalClicks = Object.values(jsonData.totals.dist)
            .reduce((sum, country) => sum + country.clicks, 0);

        // Set total visits
        if (pageElements.totalVisits) {
            pageElements.totalVisits.textContent = totalClicks.toLocaleString();
        }

        // Prepare pie chart data
        const pieData = [
            ['Category', 'Percentage'],
            ['Mobile', jsonData.deviceDistribution.mobile],
            ['Desktop', jsonData.deviceDistribution.desktop]
        ];

        // Prepare column chart data
        const columnData = [
            ['Category', 'Percentage'],
            ['DisplayAds', jsonData.channelsOverview.displayAds],
            ['Paid', jsonData.channelsOverview.paid]
        ];

        // Create DataView for pie chart with tooltip
        const pieChartData = google.visualization.arrayToDataTable(pieData);
        const pieView = new google.visualization.DataView(pieChartData);
        pieView.setColumns([0, 1, createTooltipColumn(pieChartData)]);

        // Draw Pie Chart with updated tooltip
        const pieChart = new google.visualization.PieChart(pageElements.pieChart);
        pieChart.draw(pieView, {
            colors: ['#6a98f6', '#3366cc'],
            tooltip: {
                isHtml: true,
                textStyle: { fontSize: 14 },
                trigger: 'focus'
            },
            legend: {
                position: 'bottom',
                textStyle: {
                    fontSize: 12,
                    color: 'black'
                }
            },
            fontSize: 14
        });

        // Create DataView for column chart with tooltip
        const columnChartData = google.visualization.arrayToDataTable(columnData);
        const columnView = new google.visualization.DataView(columnChartData);
        columnView.setColumns([0, 1, createTooltipColumn(columnChartData)]);

        // Draw Column Chart with updated tooltip
        const columnChart = new google.visualization.ColumnChart(pageElements.columnChart);
        columnChart.draw(columnView, {
            colors: ['#6a98f6', '#3366cc'],
            tooltip: {
                isHtml: true,
                textStyle: { fontSize: 14 },
                trigger: 'focus'
            },
            legend: { position: 'none' },
            hAxis: {
                textStyle: { fontSize: 12 }
            },
            vAxis: {
                title: '',
                format: '#\'%\'',
                viewWindow: { min: 0, max: 100 },
                textStyle: { fontSize: 12 }
            }
        });

        // Prepare geo chart data
        const geoDataTable = new google.visualization.DataTable();
        geoDataTable.addColumn('string', 'Country');
        geoDataTable.addColumn('number', 'Percentage');
        geoDataTable.addColumn({type: 'string', role: 'tooltip', p: {html: true}});

        // Add data rows for geo chart
        Object.entries(jsonData.totals.dist).forEach(([countryCode, data]) => {
            const percentage = (data.clicks / totalClicks) * 100;
            geoDataTable.addRow([
                countryCode,
                percentage,
                `<div style="padding:0px; font-family: Arial, sans-serif; font-size: 14px; width: 60px;">
                    ${percentage.toFixed(2)}%
                </div>`
            ]);
        });

        // Draw Geo Chart with updated tooltip
        const geoChart = new google.visualization.GeoChart(pageElements.geoChart);
        geoChart.draw(geoDataTable, {
            colorAxis: {
                colors: ['#cfddfa', '#a5c4f7', '#7ca0f4', '#527cf1', '#3366cc'],
                minValue: 0,
                maxValue: 100
            },
            legend: {
                textStyle: { fontSize: 14 }
            },
            tooltip: {
                isHtml: true,
                trigger: 'focus',
                textStyle: { fontSize: 14 }
            }
        });

    } catch (error) {
        console.error('Error in drawCharts:', error);
    }
}

async function updateLegendTable() {
    try {
        // Use fetchJsonData instead of fetchGeoData
        const jsonData = await fetchJsonData(currentJsonFile);
        const totalClicks = Object.values(jsonData.totals.dist)
            .reduce((sum, country) => sum + country.clicks, 0);

        pageElements.legendDiv.innerHTML = '';
        
        // Convert the data structure directly from jsonData
        const legendData = Object.entries(jsonData.totals.dist)
            .map(([countryCode, data]) => [
                getCountryName(countryCode),
                data.clicks,
                (data.clicks / totalClicks) * 100
            ])
            .sort((a, b) => b[1] - a[1]); // Sort by clicks in descending order

        const columnsContainer = document.createElement('div');
        columnsContainer.style.display = 'flex';
        columnsContainer.style.justifyContent = 'space-between';
        columnsContainer.style.gap = '40px';
        pageElements.legendDiv.appendChild(columnsContainer);

        const [leftColumn, rightColumn] = [document.createElement('div'), document.createElement('div')];
        const middleIndex = Math.ceil(legendData.length / 2);
        const [leftData, rightData] = [legendData.slice(0, middleIndex), legendData.slice(middleIndex)];

        const createLegendItems = (data, column) => {
            data.forEach(item => {
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';

                const countryDiv = document.createElement('div');
                countryDiv.className = 'legend-country';
                countryDiv.textContent = item[0]; // Country name

                const clicksDiv = document.createElement('div');
                clicksDiv.className = 'legend-percentage';
                clicksDiv.textContent = `${item[2].toFixed(2)}%`; // Percentage

                legendItem.append(countryDiv, clicksDiv);
                column.appendChild(legendItem);
            });
        };

        createLegendItems(leftData, leftColumn);
        createLegendItems(rightData, rightColumn);
        columnsContainer.append(leftColumn, rightColumn);

    } catch (error) {
        console.error('Error updating legend table:', error);
    }
}
async function setTimeOnSite() {
    try {
        const jsonData = await fetchJsonData(currentJsonFile);
        const timeInMinutes = Math.floor(jsonData.timeOnSite);
        const seconds = Math.round((jsonData.timeOnSite - timeInMinutes) * 60);
        pageElements.timeTitle.textContent = `00:${String(timeInMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } catch (error) {
        console.error('Error fetching time on site:', error);
        pageElements.timeTitle.textContent = '00:00:00';
    }
}

function updateAllCharts() {
    drawCharts();
    updateLegendTable();
}

google.charts.setOnLoadCallback(async () => {
    try {
        // Set initial JSON file
        currentJsonFile = 'day.json';
        
        // Draw all charts with initial day.json data
        await drawLineChart('daily');
        await drawCharts();
        await updateLegendTable();
        await setTimeOnSite();
        
        // Set initial active button state
        toggleActiveMode('btnD');
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});

/*pdf script*/
function saveAsPDF() {
    const { jsPDF } = window.jspdf;

    html2canvas(document.body, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Adjusting PDF dimensions
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width; 

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save("page.pdf");
    });
}
