var focusChart = dc.seriesChart("#test");
var overviewChart = dc.seriesChart("#test-overview");
var allCount = dc.dataCount('.dc-data-count');
var overviewTable = dc.dataTable('.dc-data-table');
var ndx, runDimension, runGroup, overviewRunDimension, overviewRunGroup;
d3.csv("dau.csv", function(error, experiments) {
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
        .seriesAccessor(function(d) {
            if(d.key[0] ==1 )
                return "DAU_japan"
            else if(d.key[0] ==2)
                return "DAU_korea"
            else if(d.key[0] ==3)
                return "DAU"
            else if(d.key[0]==4)
                return "WAU"
            else if(d.key[0]==5)
                return "MAU"})
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
        .seriesAccessor(function(d) {
            if(d.key[0] ==1 )
                return "DAU_japan"
            else if(d.key[0] ==2)
                return "DAU_korea"
            else if(d.key[0]==3)
                return "DAU"
            else if(d.key[0]==4)
                return "WAU"
            else if(d.key[0]==5)
                return "MAU"
        })
        .keyAccessor(function(d) {return +d.key[1];})
        .valueAccessor(function(d) {return +d.value;})



    dc.renderAll();
});