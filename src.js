// link do podataka: https://www.kaggle.com/lava18/google-play-store-apps/tasks
var options = {
    chart: {
        type: 'pie'
    },
    title: {
        text: 'The most popular category' // that has the largest number of installs
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            }
        }
    },
    series: []
    // series: [{
        // type: 'pie',
        // data: [
            // ['FAMILI', 50],
            // ['MEDICINE', 30],
            // ['BUSINESS', 40]
    //     ]
    // }]
};
$.ajax({  
    url: 'googleplaystore.csv', // preuzimanje podataka iz .csv
    dataType: 'text',  
    success: function(data) { 
        var dataObjs = []
        var dataKeys = []
        var lines = data.split('\n') 
        lines.forEach(function(line, lineNo) {
            if (lineNo == 0) { // header
                var items = line.split(',')
                items.forEach(item => dataKeys.push(item))
            } else { // podaci
                var dataObj = {}
                // var items = line.split(/,(?! )/g)
                const items = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/g)
                items.forEach((item, itemNo) => dataObj[dataKeys[itemNo]] = item)
                dataObjs.push(dataObj)
            }
        })
        console.log(dataObjs)
        // installsByCategoryPie(dataObjs)
        pie(dataObjs)
        appsByContentRating(dataObjs)
        lineLastUpdated(dataObjs)
        areaLastUpdated(dataObjs)
        barChart(dataObjs)
        heatMap(dataObjs)
        treeMap(dataObjs)
        pie3D(dataObjs)
        column3D(dataObjs)
        scatter(dataObjs)
        bubble(dataObjs)
    },  
    error: function (e, t) {  
        console.error(e, t);  
    }  
});

// broj aplikacija po Content Ratingu
function pie(dataObjs) {
    const grouped = _.groupBy(dataObjs, app => app['Content Rating'])
    console.log(grouped)
    const series = {
        type: 'pie',
        name: 'Application by Content Rating',
        data: []
    }

    for (const contentRating in grouped) {
        if (contentRating != '') {
            series.data.push({
                name: contentRating,
                y: grouped[contentRating].length
            })
        }
        // if (grouped[category].length > 2) {
        //     // const sum = grouped[category].reduce((sum, app) => sum += Number(app.Reviews), 0)
        //     const sum = grouped[category].reduce((sum, app) => sum += Number(app.Installs.slice(1, -3).replace(/,/g, '')), 0)
        //     series.data.push({
        //         name: category,
        //         y: sum
        //     })
        // }
    }
    console.log(series.data)
    options.series.push(series)
    Highcharts.chart('container', options)
}

function appsByContentRating(dataObjs) {
    const grouped = _.groupBy(dataObjs, app => app['Content Rating'])
    console.log(grouped)
    const xAxis = []
    const seriesData = []
    for (const gr in grouped) {
        xAxis.push(gr)
        seriesData.push(grouped[gr].length)
    }
    var options = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Applications By Content Rating'
        },
        xAxis: {
            categories: xAxis
        },
        yAxis: {
            title: {
                text: 'Number of Applications'
            }
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        series: [{
            name: 'Content Rating',
            data: seriesData
        }]
    }
    Highcharts.chart('appsByContentRating', options)
}

// line - broj app po godinama last updated
function lineLastUpdated(dataObjs) {
    const dataObjsFiltered = dataObjs.filter(dataObj => dataObj['Last Updated'].indexOf('201') > -1 && dataObj['Last Updated'].indexOf('2010') == -1) // filtriranje nevalidnih
    const groupedByLastUpdatedYear = _.groupBy(dataObjsFiltered, app => app['Last Updated'].substr(app['Last Updated'].length - 5, 4))
    console.log(groupedByLastUpdatedYear)
    const years = [], yearsData = []
    for (const year in groupedByLastUpdatedYear) {
        years.push(year)
        yearsData.push(groupedByLastUpdatedYear[year].length)
    }

    var options = {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Number of Applications by Last Updated Year'
        },
        xAxis: {
            categories: years
        },
        yAxis: {
            title: {
                text: 'Number of Applications'
            }
        },
        // tooltip: {
        //     pointFormat: '<b>{point.y}</b>'
        // },
        series: [{
            data: yearsData
        }]
    }
    Highcharts.chart('top10Apps', options)
}

// area - broj app po godinama last updated - dve serije: free i paid
function areaLastUpdated(dataObjs) {
    console.log(dataObjs)
    const dataObjsFiltered = dataObjs.filter(dataObj => dataObj['Last Updated'].indexOf('201') > -1 && dataObj['Last Updated'].indexOf('2010') == -1) // filtriranje nevalidnih
    const groupedByType = _.groupBy(dataObjsFiltered, app => app.Type)
    const groupedByFree = groupedByType.Free
    const groupedByPaid = groupedByType.Paid
    const groupedByLastUpdatedYearFree = _.groupBy(groupedByFree, app => app['Last Updated'].substr(app['Last Updated'].length - 5, 4))
    const groupedByLastUpdatedYearPaid = _.groupBy(groupedByPaid, app => app['Last Updated'].substr(app['Last Updated'].length - 5, 4))
    const years = [], yearsFreeData = [], yearsPaidData = []
    for (const year in groupedByLastUpdatedYearFree) {
        years.push(year)
        yearsFreeData.push(groupedByLastUpdatedYearFree[year].length)
    }
    for (const year in groupedByLastUpdatedYearPaid) {
        years.push(year)
        yearsPaidData.push(groupedByLastUpdatedYearPaid[year].length)
    }
    console.log(yearsFreeData)
    console.log(yearsPaidData)

    var options = {
        chart: {
            type: 'area'
        },
        title: {
            text: 'Number of Applications by Last Updated Year'
        },
        xAxis: {
            categories: years
        },
        yAxis: {
            title: {
                text: 'Number of Applications'
            }
        },
        plotOptions: {
            area: {
               stacking: 'normal',
               lineColor: '#666666',
               lineWidth: 1,
               marker: {
                  lineWidth: 1,
                  lineColor: '#666666'
               }
            }
         },
        // tooltip: {
        //     pointFormat: '<b>{point.y}</b>'
        // },
        series: [{
            name: 'Free',
            data: yearsFreeData
        },
        {
            name: 'Paid',
            data: yearsPaidData
        }]
    }
    Highcharts.chart('area', options)
}

function barChart(dataObjs) {
    const dataObjsFiltered = dataObjs.filter(dataObj => dataObj['Last Updated'].indexOf('201') > -1 && dataObj['Last Updated'].indexOf('2010') == -1) // filtriranje nevalidnih
    const groupedByType = _.groupBy(dataObjsFiltered, app => app.Type)
    const groupedByFree = groupedByType.Free
    const groupedByPaid = groupedByType.Paid
    const groupedByLastUpdatedYearFree = _.groupBy(groupedByFree, app => app['Last Updated'].substr(app['Last Updated'].length - 5, 4))
    const groupedByLastUpdatedYearPaid = _.groupBy(groupedByPaid, app => app['Last Updated'].substr(app['Last Updated'].length - 5, 4))
    const years = [], yearsFreeData = [], yearsPaidData = []
    for (const year in groupedByLastUpdatedYearFree) {
        years.push(year)
        yearsFreeData.push(groupedByLastUpdatedYearFree[year].length)
    }
    for (const year in groupedByLastUpdatedYearPaid) {
        years.push(year)
        yearsPaidData.push(groupedByLastUpdatedYearPaid[year].length)
    }
    console.log(yearsFreeData)

    const options = {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Number of Applications by Last Updated Year'  
        },
        xAxis: {
            categories: years,
            title: {
               text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
               text: 'Number of Applications',
               align: 'high'
            },
            labels: {
               overflow: 'justify'
            }
        },
        tooltip: {
            //valueSuffix: ' millions'
        },
        plotOptions: {
            bar: {
               dataLabels: {
                  enabled: true
               }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 100,
            floating: true,
            borderWidth: 1,
            
            backgroundColor: (
               (Highcharts.theme && Highcharts.theme.legendBackgroundColor) ||
                  '#FFFFFF'),
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: [
            {
               name: 'Free',
               data: yearsFreeData
            }, 
            {
               name: 'Paid',
               data: yearsPaidData
            }
        ]
    }

    Highcharts.chart('bar', options)
}

function heatMap (dataObjs) {
    const heatMapOptions = {
        chart: {
            type: 'heatmap',
            marginTop: 40,
            marginBottom: 80,
            plotBorderWidth: 1
        },
        title: {
            text: 'Applications per Category per Rating'
        },
        xAxis: {
            // categories: ['Alexander', 'Marie', 'Maximilian', 'Sophia', 'Lukas', 'Maria', 'Leon', 'Anna', 'Tim', 'Laura']
            categories: []
        },
        yAxis: {
            // categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            categories: [],
            title: null
        },
        colorAxis: {
            min: 0,
            minColor: '#FFFFFF',
            maxColor: Highcharts.getOptions().colors[0]
        },
        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'top',
            y: 25,
            symbolHeight: 280
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> sold <br><b>' +
                    this.point.value + '</b> items on <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
            }
        },
        series: [{
            name: 'Sales per employee',
            borderWidth: 1,
            data: [],
            dataLabels: {
                enabled: true,
                color: '#000000'
            }
        }]
    }

    dataObjs = dataObjs.filter(dataObj => dataObj.Rating != 'NaN')
    const groupedByCategory = _.groupBy(dataObjs, app => app.Category)

    heatMapOptions.yAxis.categories = ['0.0 .. 0.5','0.5 .. 1.0','1.0 .. 1.5','1.5 .. 2.0','2.0 .. 2.5','2.5 .. 3.0','3.0 .. 3.5','3.5 .. 4.0','4.0 .. 4.5','4.5 .. 5.0']
    
    const matrix = []
    for (const categoryGroup in groupedByCategory) {
        if (groupedByCategory[categoryGroup].length > 2) {
            heatMapOptions.xAxis.categories.push(categoryGroup)
            const groupedByCategoryTransform = groupedByCategory[categoryGroup].map(app => {
                return {
                    ...app,
                    Rating: transformRating(Number(app.Rating))
                }
            })
            const groupedByRating = _.groupBy(groupedByCategoryTransform, app => app.Rating)
            console.log(groupedByRating)
            const matrixRow = []
            for (const rating of heatMapOptions.yAxis.categories) {
                if (groupedByRating[rating]) {
                    matrixRow.push(groupedByRating[rating].length)
                } else {
                    matrixRow.push(0)
                }
            }
            matrix.push(matrixRow)
        }
    }
    for (var i = 0; i < heatMapOptions.xAxis.categories.length; i++) {
        for (var j = 0; j < heatMapOptions.yAxis.categories.length; j++) {
            heatMapOptions.series[0].data.push([i, j, matrix[i][j]])
        }
    }
    console.log(heatMapOptions)
    Highcharts.chart('heatMap', heatMapOptions)
}
function transformRating (rating) {
    return rating < 0.5 ? '0.0 .. 0.5'
        : rating < 1 ? '0.5 .. 1.0'
        : rating < 1.5 ? '1.0 .. 1.5'
        : rating < 2 ? '1.5 .. 2.0'
        : rating < 2.5 ? '2.0 .. 2.5'
        : rating < 3 ? '2.5 .. 3.0'
        : rating < 3.5 ? '3.0 .. 3.5'
        : rating < 4 ? '3.5 .. 4.0'
        : rating < 4.5 ? '4.0 .. 4.5'
        : '4.5 .. 5.0'
}

// po kategorijama koliko ima free i paid
function treeMap (dataObjs) {
    const treeMapOptions= {
        title: {
            text: 'Free/Paid Applications By Category'   
        },
        series: [{
        type: "treemap",
        layoutAlgorithm: 'stripes',
        alternateStartingDirection: true,
        
        levels: [{
           level: 1,
           layoutAlgorithm: 'sliceAndDice',
           dataLabels: {
              enabled: true,
              align: 'left',
              verticalAlign: 'top',
              style: {
                 fontSize: '15px',
                 fontWeight: 'bold'
              }
           }
        }],
        data: [
            {
              id: 'Free',
              name: 'Free',
              color: "#EC2500"
           }, 
           {
              id:'Paid',
              name: 'Paid',
              color: "#ECE100"
           },
        ]
     }]
    }

    const groupedByType = _.groupBy(dataObjs, app => app.Type)
    const paid = groupedByType.Paid
    const free = groupedByType.Free
    const groupedPaidByCategory = _.groupBy(paid, app => app.Category)
    const groupedFreeByCategory = _.groupBy(free, app => app.Category)
    for(const category in groupedFreeByCategory) {
        treeMapOptions.series[0].data.push({
            name: category,
            parent: 'Free',
            value: groupedFreeByCategory[category].length
        })
    }
    for(const category in groupedPaidByCategory) {
        treeMapOptions.series[0].data.push({
            name: category,
            parent: 'Paid',
            value: groupedPaidByCategory[category].length
        })
    }


    Highcharts.chart('treeMap', treeMapOptions)
}

function pie3D (dataObjs) {
    const pie3DOptions = {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: 'Applications by Content Rating'
        },
        tooltip: {
            // pointFormat: '{series.name}: &lt;b&gt;{point.percentage:.1f}%</b>'
            pointFormat: '{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        },
        series: [{
            type: 'pie',
            // name: 'Social Logins',
            data: [
                // ['Facebook', 44],
                // ['Twitter', 5],
                // {
                //     name: 'Linkedin',
                //     y: 3,
                //     sliced: true,
                //     selected: true
                // },
                // ['Yahoo', 5],
                // ['Google plus', 37],
                // ['Others', 4]
            ]
        }]
    }

    const grouped = _.groupBy(dataObjs, app => app['Content Rating'])
    console.log(grouped)

    for (const contentRating in grouped) {
        if (contentRating != '') {
            pie3DOptions.series[0].data.push([
                contentRating,
                grouped[contentRating].length
            ])
        }
    }

    Highcharts.chart('3Dpie', pie3DOptions)
}

// 3D Column Chart with Stacking and Grouping
// po paid/free i starosti
function column3D (dataObjs) {
    
    const groupedByType = _.groupBy(dataObjs, app => app.Type)
    const paid = groupedByType.Paid
    const free = groupedByType.Free
    
    const groupedPaidByContentRating = _.groupBy(paid, app => app['Content Rating'])
    const groupedFreeByContentRating = _.groupBy(free, app => app['Content Rating'])
    const freeData = [], paidData = []
    const contentRatings = []
    for(const contentRating in groupedFreeByContentRating) {
        contentRatings.push(contentRating)
        freeData.push(groupedFreeByContentRating[contentRating].length)
    }
    for(const contentRating in groupedPaidByContentRating) {
        paidData.push(groupedPaidByContentRating[contentRating].length)
    }
    const column3DOptions = {
        chart: {      
            type: 'column',
            marginTop: 80,
            marginRight: 40,
            options3d: {
               enabled: true,
               alpha: 15,
               beta: 15,
               viewDistance: 25,
               depth: 50
            }
        },
        title: {
            text: 'Applications by Content Rating and Type'   
        },   
        xAxis: {
            // categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
            categories: contentRatings
        },
        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                margin: 50,
               text: 'Number of apps'
            }
        },
        tooltip: {
            headerFormat: '<b>{point.key}</b><br>',
            pointFormat: '<span style = "color:{series.color}">\u25CF</span> {series.name}:{point.y} / {point.stackTotal}'
        },
        plotOptions: {
            column: {
               stacking: 'normal',
               depth: 40
            }
        },   
        series: [
            {
                name: 'Paid',
                data: paidData
            },
            {
                name: 'Free',
                data: freeData
            }
        ]
    }

    Highcharts.chart('3Dcolumn', column3DOptions)
}

// scatter - za svaku aplikaciju rating i broj pregleda - dve serije: paid i free
function scatter (dataObjs) {
    const dataFree = [], dataPaid = []
    const groupedByType = _.groupBy(dataObjs, app => app.Type)
    const paidObjs = groupedByType.Paid
    const freeObjs = groupedByType.Free
    
    for(const paidObj of paidObjs) {
        dataPaid.push([Number(paidObj.Rating), Number(paidObj.Reviews)])
    }
    for(const freeObj of freeObjs) {
        dataFree.push([Number(freeObj.Rating), Number(freeObj.Reviews)])
    }
    const scatterOptions = {
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: 'Rating Versus Reviews of Applications by Type'   
        },
        xAxis: {
            title: {
               enabled: true,
               text: 'Rating'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
        },
        yAxis: {
            title: {
               text: 'Reviews'
            }
        },
        legend: {   
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: (
               Highcharts.theme && Highcharts.theme.legendBackgroundColor) ||
               '#FFFFFF',
            borderWidth: 1
        },  
        plotOptions: {
            scatter: {
               marker: {
                  radius: 5,
                  states: {
                     hover: {
                        enabled: true,
                        lineColor: 'rgb(100,100,100)'
                     }
                  }
               },
               states: {
                  hover: {
                     marker: {
                        enabled: false
                     }
                  }
               },
               tooltip: {
                  headerFormat: '<b>{series.name}</b><br>',
                  pointFormat: 'Rating: {point.x}, Reviews: {point.y}'
               }
            }
        },
        series: [
            {
                name: 'Free',
                color: 'rgba(119, 152, 191, .5)',
                data: dataFree
            },
            {
                name: 'Paid',
                color: 'rgba(223, 83, 83, .5)',
                data: dataPaid
            }
        ]    
    }
    

    Highcharts.chart('scatter', scatterOptions)
}
// bubble - za 200 aplikacija rating, broj pregleda i velicina - dve serije: paid i free
function bubble (dataObjs) {
    const dataFree = [], dataPaid = []
    const first200 = dataObjs.filter(app => app.Size.indexOf('M') > -1).slice(100, 200)
    const groupedByType = _.groupBy(first200, app => app.Type)
    const paidObjs = groupedByType.Paid
    const freeObjs = groupedByType.Free
    for(const paidObj of paidObjs) {
        dataPaid.push([Number(paidObj.Rating), Number(paidObj.Reviews), Number(paidObj.Size.substring(0, paidObj.Size.length - 1))])
    }
    for(const freeObj of freeObjs) {
        dataFree.push([Number(freeObj.Rating), Number(freeObj.Reviews), Number(freeObj.Size.substring(0, freeObj.Size.length - 1))])
    }
    const bubbleOptions = {
        chart: {
            type: 'bubble',
            zoomType: 'xy'
        },
        title: {
            text: 'Rating Versus Reviews of 200 Applications by Type'   
        },
        xAxis: {
            title: {
               text: 'Rating'
            }
        },
        yAxis: {
            title: {
               text: 'Reviews',
               // align: 'high'
            },
            labels: {
               overflow: 'justify'
            }
        },
        series: [
            {
                data: dataFree,
                name: 'Free'
            },
            {
                data: dataPaid,
                name: 'Paid'
            }
        ]
    }
        
    Highcharts.chart('bubble', bubbleOptions)
}