var focusChart = dc.seriesChart("#test");
var overviewChart = dc.seriesChart("#test-overview");
var allCount = dc.dataCount('.dc-data-count');
var overviewTable = dc.dataTable('.dc-data-table');
var ndx, runDimension, runGroup, overviewRunDimension, overviewRunGroup;
d3.csv("morley.csv", function(error, experiments) {
    ndx = crossfilter(experiments);
    var all = ndx.groupAll();
    runDimension = ndx.dimension(function(d) {return [+d.Expt, +d.Key]; });
    overviewRunDimension = ndx.dimension(function(d) {return [+d.Expt, +d.Key]; });
    runGroup = runDimension.group().reduceSum(function(d) { return +d.Doc_count; });
    overviewRunGroup = overviewRunDimension.group().reduceSum(function(d) { return +d.Doc_count; });

    focusChart
        .width(768)
        .height(480)
        .chart(function(c) { return dc.lineChart(c).interpolate('cardinal').evadeDomainFilter(true); })
        .x(d3.scale.linear().domain([502,531]))
        .brushOn(false)
        .yAxisLabel("DAU")
        .xAxisLabel("Day")
        .elasticY(true)
        .dimension(runDimension)
        .group(runGroup)
        .mouseZoomable(true)
        .rangeChart(overviewChart)
        .seriesAccessor(function(d) {return "total";})
        .keyAccessor(function(d) {return +d.key[1];})
        .valueAccessor(function(d) {return +d.value;})
        .legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
    focusChart.yAxis().tickFormat(function(d) {return d3.format(',d')(d);});
    focusChart.margins().left += 40;

    focusChart.elasticX = function() {
        return arguments.length ? this : false;
    };
    function rangesEqual (range1, range2) {
        if (!range1 && !range2) {
            return true;
        } else if (!range1 || !range2) {
            return false;
        } else if (range1.length === 0 && range2.length === 0) {
            return true;
        } else if (range1[0].valueOf() === range2[0].valueOf() &&
            range1[1].valueOf() === range2[1].valueOf()) {
            return true;
        }
        return false;
    }
    overviewChart
        .width(768)
        .height(100)
        .chart(function(c,_,_,i) {
            var chart = dc.lineChart(c).interpolate('cardinal');
            if(i===0)
                chart.on('filtered', function (chart) {
                    if (!chart.filter()) {
                        dc.events.trigger(function () {
                            overviewChart.focusChart().x().domain(overviewChart.focusChart().xOriginalDomain());
                            overviewChart.focusChart().redraw();
                        });
                    } else if (!rangesEqual(chart.filter(), overviewChart.focusChart().filter())) {
                        dc.events.trigger(function () {
                            overviewChart.focusChart().focus(chart.filter());
                        });
                    }
                });
            return chart;
        })
        .x(d3.scale.linear().domain([502,531]))
        .brushOn(true)
        .xAxisLabel("Day")
        .clipPadding(10)
        .dimension(runDimension)
        .group(runGroup)
        .seriesAccessor(function(d) {return "total" })
        .keyAccessor(function(d) {return +d.key[1];})
        .valueAccessor(function(d) {return +d.value;})

    allCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
        .dimension(ndx)
        .group(all)
        // (_optional_) `.html` sets different html when some records or all records are selected.
        // `.html` replaces everything in the anchor with the html given using the following function.
        // `%filter-count` and `%total-count` are replaced with the values obtained.
        .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
            ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });


    overviewTable /* dc.dataTable('.dc-data-table', 'chartGroup') */
        .dimension(runDimension)
        // Data table does not use crossfilter group but rather a closure
        // as a grouping function
        .group(function (d) {
            var format = d3.format('02d');
            return d.run;
        })
        // (_optional_) max number of records to be shown, `default = 25`
        .size(50)
        .columns([
            {
                label: "Date",
                format :  function (d) {return "2017"+ d.Key;}
            },
            {
                label: "Total DAU",
                format :  function (d) {return d.Doc_count;}
            },


        ])

        // (_optional_) sort using the given field, `default = function(d){return d;}`
        .sortBy(function (d) {
            return d.Key;
        })
        // (_optional_) sort order, `default = d3.ascending`
        .order(d3.ascending)
        // (_optional_) custom renderlet to post-process chart using [D3](http://d3js.org)
        .on('renderlet', function (table) {
            table.selectAll('.dc-table-group').classed('info', true);
        });



    dc.renderAll();
});