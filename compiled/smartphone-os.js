var all_os, color_map, csv, events, get_os_color, i, init, int, os_colors, quarter_charts, quarter_data, quarter_pie, quarters_index, selected_idx, selected_os_idx, selected_quarter, timeline_data, timeline_os, _i, _len;

all_os = ['Bada', 'Android', 'iOS', 'RIM', 'Symbian', 'Windows Mobile', 'Windows Phone', 'Other'];

timeline_os = ['Android', 'iOS', 'RIM', 'Symbian', 'Windows Phone'];

csv = null;

quarter_data = [];

quarters_index = {};

selected_idx = null;

selected_os_idx = 0;

selected_quarter = [];

timeline_data = [];

color_map = {};

os_colors = d3.zip(all_os, d3.scale.category10().range());

for (_i = 0, _len = os_colors.length; _i < _len; _i++) {
  i = os_colors[_i];
  color_map[i[0]] = i[1];
}

get_os_color = function(os) {
  if (color_map.hasOwnProperty(os)) {
    return color_map[os];
  }
  return '#eeeeee';
};

int = function(v) {
  return parseInt(v, 10);
};

quarter_pie = function() {
  var os_percentage, other_os, other_percentage, selected_os, so, total_smartphones;
  selected_os = quarter_data[selected_os_idx];
  total_smartphones = int(selected_quarter['Total Smartphones']);
  other_os = total_smartphones - selected_os.value;
  os_percentage = selected_os.value ? 100 / total_smartphones * selected_os.value : 0;
  other_percentage = other_os ? 100 / total_smartphones * other_os : 0;
  pie('#quarter-share', [
    {
      'label': selected_os.label,
      'value': os_percentage
    }, {
      'label': 'All else',
      'value': other_percentage
    }
  ]);
  so = d3.select('#select-os');
  so.selectAll('option').remove();
  so.selectAll('option').data(quarter_data).enter().append('option').attr('value', function(d, i) {
    return i;
  }).attr('selected', function(d, i) {
    if (int(selected_os_idx) === i) {
      return 'selected';
    } else {
      return null;
    }
  }).text(function(d) {
    return d.label;
  });
  return so.on('change', function() {
    selected_os_idx = d3.event.target.value;
    return quarter_pie();
  });
};

quarter_charts = function() {
  var os, val, _j, _len1;
  selected_quarter = csv[selected_idx];
  quarter_data = [];
  for (_j = 0, _len1 = all_os.length; _j < _len1; _j++) {
    os = all_os[_j];
    val = int(selected_quarter[os]);
    if (val) {
      quarter_data.push({
        'label': os,
        'value': val
      });
    }
  }
  quarter_data.sort(function(a, b) {
    return d3.descending(a.value, b.value);
  });
  bar('#quarter-all-os', [
    {
      'key': selected_quarter['Quarter'],
      'values': quarter_data
    }
  ]);
  selected_os_idx = 0;
  return quarter_pie();
};

events = function() {
  var sq;
  d3.select('#select-chart-type').on('change', function() {
    d3.select('#timeline').selectAll('*').remove();
    return timeline('#timeline', timeline_data, d3.event.target.value, get_os_color);
  });
  sq = d3.select('#select-quarter');
  sq.selectAll('option').data(d3.entries(quarters_index)).enter().append('option').attr('value', function(d) {
    return d.value;
  }).attr('selected', function(d) {
    if (selected_idx === int(d.value)) {
      return 'selected';
    } else {
      return null;
    }
  }).text(function(d) {
    return d.key;
  });
  return sq.on('change', function() {
    selected_idx = d3.event.target.value;
    return quarter_charts();
  });
};

init = function(error, data) {
  var d, date, idx, os, os_sum, other, row, val, values, values_by_os, _j, _k, _len1, _len2;
  csv = data;
  values_by_os = {};
  for (_j = 0, _len1 = timeline_os.length; _j < _len1; _j++) {
    os = timeline_os[_j];
    values_by_os[os] = [];
  }
  values_by_os['Other'] = [];
  for (idx in csv) {
    row = csv[idx];
    os_sum = 0;
    quarters_index[row['Quarter']] = idx;
    d = row.Date.split('-');
    date = new Date(int(d[0]), int(d[1]) - 1, int(d[2])).getTime();
    for (_k = 0, _len2 = timeline_os.length; _k < _len2; _k++) {
      os = timeline_os[_k];
      val = int(row[os]);
      os_sum += val;
      values_by_os[os].push([date, val]);
    }
    other = int(row['Total Smartphones']) - os_sum;
    values_by_os['Other'].push([date, other]);
  }
  for (os in values_by_os) {
    values = values_by_os[os];
    timeline_data.push({
      'key': os,
      'values': values
    });
  }
  timeline('#timeline', timeline_data, 'area', get_os_color);
  selected_idx = csv.length - 1;
  quarter_charts();
  return events();
};

queue().defer(d3.csv, '/data/mobile-os-market-share.csv').await(init);
