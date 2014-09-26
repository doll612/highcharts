$(function () {
    $.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {

        // Create the chart
        $('#container').highcharts('StockChart', {

            rangeSelector: {
                selected: 1
            },

            title: {
                text: 'AAPL Stock Price'
            },

            series: [{
                name: 'AAPL Stock Price',
                data: data,
                step: true,
                tooltip: {
                    valueDecimals: 2
                }
            }]
        });
    });
});