var map;

map = {
  geo: null,
  conf: {},
  defaults: {
    width: 960,
    height: 580,
    selector: '#map',
    colorize: null,
    title: null,
    format: null
  },
  init: function(geo, conf) {
    var key, val, _ref;
    map.geo = geo;
    _ref = map.defaults;
    for (key in _ref) {
      val = _ref[key];
      if (conf.hasOwnProperty(key)) {
        map.conf[key] = conf[key];
      } else {
        map.conf[key] = val;
      }
    }
    if (!map.conf.title) {
      return map.conf.title = function(d) {
        return d.properties.name;
      };
    }
  },
  draw: function() {
    var mesh, projection, svg_countries;
    projection = d3.geo.naturalEarth().scale(map.conf.width / 5).translate([map.conf.width / 2.2, map.conf.height / 1.7]).precision(.1);
    map.path = d3.geo.path().projection(projection);
    d3.select(map.conf.selector).select('svg').remove();
    map.svg = d3.select(map.conf.selector).append('svg').attr('width', map.conf.width).attr('height', map.conf.height);
    svg_countries = map.svg.append('g').attr('class', 'countries').selectAll('path').data(topojson.feature(map.geo, map.geo.objects.units).features);
    svg_countries.enter().append('path').attr('class', 'country').style('fill', function(d) {
      return map.conf.colorize(d);
    }).attr('d', map.path).append('title').text(function(d) {
      return map.conf.title(d);
    });
    mesh = topojson.mesh(map.geo, map.geo.objects.units, function(a, b) {
      return a !== b;
    });
    return map.svg.insert('path').datum(mesh).attr('class', 'boundary').attr('d', map.path);
  },
  legend: function(min_val, max_val, colors) {
    var cscale, fformat, iformat, lg, lh, lw, max_formated, max_formatted, min_formated, min_formatted, sg;
    iformat = d3.format('f');
    fformat = d3.format('.2f');
    lw = 300;
    lh = 15;
    min_formatted = iformat(min_val);
    if (min_formatted !== min_val) {
      min_formated = fformat(min_val);
    }
    max_formatted = iformat(max_val);
    if (max_formatted !== max_val) {
      max_formated = fformat(max_val);
    }
    map.svg.select('g#legend').remove();
    lg = map.svg.append('g').attr('id', 'legend').attr('width', lw).attr('height', lh).attr('transform', 'translate(' + ((map.conf.width - lw) / 2) + ', ' + (map.conf.height - lh) + ')');
    lg.append('rect').attr('class', 'legend-box').attr('width', lw).attr('height', lh);
    cscale = {
      w: lw / colors.length,
      h: lh,
      offset_y: 0
    };
    sg = lg.append('g');
    sg.append('text').text(min_formatted).attr('x', -30).attr('y', 9);
    sg.append('text').text(max_formatted).attr('x', lw + 10).attr('y', 9);
    return sg.selectAll('rect').data(colors).enter().append('rect').attr('x', function(d, i) {
      return i * cscale.w;
    }).attr('fill', function(d, i) {
      return colors[i];
    }).attr('width', cscale.w).attr('height', cscale.h);
  }
};
