var draw, f, factor, init, quantize, scheme, selected_map;

f = d3.format('.02f');

selected_map = 'users_by_pop';

scheme = colorbrewer.Blues[9];

factor = 100000;

quantize = function(min_val, max_val) {
  return d3.scale.quantize().domain([min_val, max_val]).range(d3.range(scheme.length).map(function(i) {
    return scheme[i];
  }));
};

draw = function(geo, lico, country_index, min_users, max_users, min_users_by_pop, max_users_by_pop) {
  var color, height, selector, title, width;
  color = function(country) {
    var color_val, idx;
    color_val = '#eee';
    idx = country_index[country.id];
    if (idx && lico[idx].pop_count > 0) {
      if ('users_by_pop' === selected_map) {
        color_val = quantize(min_users_by_pop, max_users_by_pop)(lico[idx].user_count / lico[idx].pop_count);
      } else {
        color_val = quantize(min_users, max_users)(lico[idx].user_count);
      }
    }
    return color_val;
  };
  title = function(country) {
    var idx;
    idx = country_index[country.id];
    if (idx) {
      if ('users_by_pop' === selected_map) {
        return lico[idx].name + ': ' + f(factor * lico[idx].user_count / lico[idx].pop_count);
      } else {
        return lico[idx].name + ': ' + f(lico[idx].user_count);
      }
    }
  };
  selector = '#map';
  width = (parseInt(d3.select(selector).style('width'), 10)) - 150;
  height = width * .48;
  map.init(geo, {
    colorize: color,
    selector: selector,
    width: width,
    height: height,
    title: title,
    format: f
  });
  map.draw();
  if ('users_by_pop' === selected_map) {
    return map.legend(factor * min_users_by_pop, factor * max_users_by_pop, scheme);
  } else {
    return map.legend(min_users, max_users, scheme);
  }
};

init = function(error, geo, lico) {
  var by_pop, country, country_index, idx, max_users, max_users_by_pop, min_users, min_users_by_pop;
  min_users = 0;
  max_users = 0;
  min_users_by_pop = 0;
  max_users_by_pop = 0;
  country_index = {};
  for (idx in lico) {
    country = lico[idx];
    country_index[country['iso3']] = idx;
    if (country.user_count > max_users) {
      max_users = country.user_count;
    }
    if (country.user_count < min_users) {
      min_users = country.user_count;
    }
    if (country.pop_count < 1000000) {
      continue;
    }
    by_pop = country.user_count / country.pop_count;
    if (by_pop > max_users_by_pop) {
      max_users_by_pop = by_pop;
    }
    if (by_pop < min_users_by_pop) {
      min_users_by_pop = by_pop;
    }
  }
  draw(geo, lico, country_index, min_users, max_users, min_users_by_pop, max_users_by_pop);
  return d3.select('#map-select').on('change', function() {
    selected_map = this.value;
    return draw(geo, lico, country_index, min_users, max_users, min_users_by_pop, max_users_by_pop);
  });
};

queue().defer(d3.json, '/geo/countries.json').defer(d3.json, '/data/lico.json').await(init);
