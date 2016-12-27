var base_dir = '/data/amazon/best-sellers',
    dates_dir = base_dir + '/laptops',
    operating_systems = ['Android', 'Chrome OS', 'Fire OS', 'Linux', 'Mac OS', 'Windows'],
    os_colors = {
        'Android': '#2b9f78',
        'Chrome OS': '#f0e424',
        'Fire OS': '#d55e00',
        'Linux': '#e69f00',
        'Mac OS': '#cc79a7',
        'Windows': '#0072b2'
        // for additional os check http://colorbrewer2.org/?type=qualitative&scheme=Set1&n=9
    },
    date_format = d3.time.format('%Y-%m-%d'),
    first_date,
    last_date;

queue()
    .defer(d3.json, base_dir + '/laptops_dates.json')
    .await(dates);

function dates(error, data) {
    var first_date = data[0],
        last_date = data[1],
        current_date = last_date,
        dp = $('#datepicker'),
        selected_date = document.location.hash.replace('#', '');

    if (selected_date && selected_date.indexOf('comment') === -1) {
        current_date = selected_date;
    }

    initDate(current_date);
    dp.val(current_date);

    dp.datepicker({
        autoclose: true,
        format: 'yyyy-mm-dd',
        startDate: first_date,
        endDate: last_date
    })
    .on('changeDate', function(e){
        current_date = date_format(e.date);
        initDate(current_date);
        document.location.hash = current_date;
    });
}

function initDate(date) {
    queue()
        .defer(d3.json, dates_dir + '/' + date + '/top100.json')
        .await(initCharts);
    d3.select('#date-info').text((new Date(date)).toDateString());
}

function initCharts(error, data) {
    var max_price = 0,
        scatter_groups = {},
        scatter_data = [];

    // FIXME indicate that an error happened.
    if (!data) return;

    // Initialize scatter groups object.
    for (i in operating_systems) {
        var os = operating_systems[i];
        scatter_groups[os] = [];
    }

    // Populate group series.
    for (i in data) {
        var d = data[i],
            os = guessOS(d.title),
            series;

        // Required info.
        if (!os || !d.price) {
            continue;
        }

        if (d.price > max_price) {
            max_price = d.price;
        }

        series = operating_systems.indexOf(os);
        scatter_groups[os].push({
            series: series,
            size: d.rating,
            x: d.rank,
            y: d.price,
            d: d
        });
    }

    // Create data structure for nvd3 scatter plot.
    for (i in operating_systems) {
        var os = operating_systems[i];
        values = scatter_groups[os];
        if (values.length) {
            scatter_data.push({key: os, values: scatter_groups[os]});
        }
    }

    var svg_scatter = d3.select('#scatter svg');
    var width = svg_scatter.style('width').replace('px', '');
    var height = ~~width * .44;
    // set minimum height
    if (height < 400) height = 400;
    svg_scatter.style('height', height + 'px');
    scatter(svg_scatter, scatter_data, max_price);
}

function guessOS(s) {
    // Assume Windows by default.
    var os = 'Windows';

    if (!s) return os;

    s = s.toLowerCase();

    if (-1 !== s.indexOf('chromebook')) {
        os = 'Chrome OS';
    }
    else if (-1 !== s.indexOf('macbook')) {
        os = 'Mac OS';
    }
    else if (-1 !== s.indexOf('linux') || -1 !== s.indexOf('ubuntu')) {
        os = 'Linux';
    }
    else if (-1 !== s.indexOf('kindle fire')) {
        os = 'Fire OS';
    }
    else if (-1 !== s.indexOf('android') || -1 !== s.indexOf('galaxy tab')) {
        os = 'Android';
    }
    return os;
}

function scatter(svg, data, max_val) {
    // Make sure os colors are independet of number of groups.
    var colors = [];
    data.forEach(function(d) { colors.push(os_colors[d.key]) });

    nv.addGraph(function() {
        var chart = nv.models.scatterChart()
            .yDomain([0, max_val])
            .sizeDomain([0, 5])
            .transitionDuration(350)
            .color(colors);

      //Configure how the tooltip looks.
      chart.tooltipContent(function(key, x, y, graph) {
          var point = graph.series.values[graph.pointIndex];
          return '<h3>' + point.d.title + '</h3>'
              + '<img class="pull-left roffset img-responsive" src="' + point.d.img_src + '">'
              + '<div class="big voffset">Price: US $' + point.d.price + '<br>'
              + 'Rating: ' + point.d.rating + ' of 5<br>'
              + 'Review Count: ' + point.d.review_count + '</div>'
              + '<p class="clearfix">Click the circle to go to the Amazon.com product page.</p>'
      });

      //Axis settings
      chart.xAxis.tickFormat(d3.format(',f'));
      chart.xAxis.axisLabel('Sales Rank');
      chart.yAxis.tickFormat(d3.format(',f'));
      chart.yAxis.axisLabel('Price');

      chart.scatter.dispatch.on('elementClick', function(element) {
          window.open(element.point.d.url);
      });

      svg.datum(data).call(chart);
      nv.utils.windowResize(chart.update);

      return chart;
    });
}