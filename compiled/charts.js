var bar, bar_image, format_date, format_int, pie, set_dim, timeline;

format_date = d3.time.format('%x');

format_int = d3.format(',d');

set_dim = function(elt, ratio) {
  var height, width;
  width = elt.style('width').replace('px', '');
  height = width * ratio;
  return elt.style('width', width).style('height', height);
};

timeline = function(selector, data, chart_type, colorize) {
  var chart, svg;
  chart = nv.models.lineChart();
  if (chart_type === 'area') {
    chart = nv.models.stackedAreaChart();
  }
  svg = d3.select(selector);
  set_dim(svg, .36);
  return nv.addGraph(function() {
    chart.x(function(d) {
      return d[0];
    }).y(function(d) {
      return d[1];
    }).color(function(d) {
      return colorize(d.key);
    }).useInteractiveGuideline(true);
    chart.xAxis.showMaxMin(false).tickFormat(function(d) {
      return format_date(new Date(d));
    });
    chart.yAxis.tickFormat(d3.format(',d'));
    svg.datum(data).transition().duration(500).call(chart);
    return chart;
  });
};

bar = function(selector, data) {
  var svg;
  svg = d3.select(selector);
  set_dim(svg, .4);
  return nv.addGraph(function() {
    var chart;
    chart = nv.models.discreteBarChart().x(function(d) {
      return d.label;
    }).y(function(d) {
      return d.value;
    }).staggerLabels(true).tooltips(false).showValues(true).valueFormat(function(d) {
      return format_int(d);
    }).color(function(d) {
      return '#1f77b4';
    });
    chart.yAxis.tickFormat(d3.format(',d'));
    d3.select(selector).datum(data).transition().duration(500).call(chart);
    return chart;
  });
};

pie = function(selector, data) {
  var svg;
  svg = d3.select(selector);
  set_dim(svg, .94);
  return nv.addGraph(function() {
    var chart;
    chart = nv.models.pieChart().x(function(d) {
      return d.label;
    }).y(function(d) {
      return d.value;
    }).showLegend(false).showLabels(true).tooltipContent(function(key, y, e, graph) {
      return '<h3>' + key + '</h3>' + '<p>' + y + '%</p>';
    });
    d3.select(selector).datum(data).transition().duration(500).call(chart);
    return chart;
  });
};

bar_image = function(selector, data, key, order) {
  var bar_data, bar_h, bar_w, func_click, func_id, func_title, labels, rects, scale_x, svg, texts;
  svg = d3.select(selector);
  bar_h = 50;
  if (!order) {
    order = 'descending';
  }
  bar_w = ~~svg.style('width').replace('px', '') - (bar_h * 2) - 10;
  func_id = function(d, i) {
    return d.url;
  };
  func_title = function(d) {
    return d.title + '\nClick to open product page.';
  };
  func_click = function(d) {
    return window.open(d.url);
  };
  bar_data = data.filter(function(d) {
    return d[key];
  }).sort(function(a, b) {
    return d3[order](a[key], b[key]);
  }).slice(0, 5);
  scale_x = d3.scale.linear().domain([
    0, d3.max(bar_data, function(d) {
      return d[key];
    })
  ]).range([0, bar_w]);
  rects = svg.selectAll('rect').data(bar_data, func_id);
  rects.enter().append('rect').on('click', func_click).append('title').text(func_title);
  rects.attr('width', function(d) {
    return scale_x(d[key]);
  }).attr('height', bar_h - 20).attr('x', bar_h + 5).attr('y', function(d, i) {
    return i * bar_h + 8;
  });
  rects.exit().remove();
  labels = svg.selectAll('image').data(bar_data, func_id);
  labels.enter().append('svg:image').attr('xlink:href', function(d) {
    return d.img_src;
  }).attr('width', bar_h).attr('height', bar_h).attr('x', 0).attr('y', function(d, i) {
    return i * bar_h;
  }).on('click', func_click).append('title').text(func_title);
  labels.exit().remove();
  texts = svg.selectAll('text').data(bar_data, func_id);
  texts.enter().append('text').attr('x', bar_h * 2 + bar_w).attr('y', function(d, i) {
    return i * bar_h;
  }).attr('dy', '2.2em').attr('text-anchor', 'end').text(function(d) {
    return d[key];
  });
  return texts.exit().remove();
};
