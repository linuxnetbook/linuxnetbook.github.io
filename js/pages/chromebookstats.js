var y_axis_label = 'Number of models';

function ascNum(a, b) {
    return a - b;
}

function rollupSpec(v) {
    return v.length;
}

function filterSpec(data, spec) {
    return data.filter(function(d) { return !!d[spec]; })
}

function nestFloatSpec(data, spec) {
    return d3.nest()
        .key(function(d) { return d[spec]; })
        .sortKeys(ascNum)
        .rollup(rollupSpec)
        .entries(filterSpec(data, spec));
}

function bar(selector, data, x_label, y_label, x_axis_type) {
    if ('undefined' === typeof x_axis_type) {
        x_axis_type = 'category';
    }
    var chart = c3.generate({
        bindto: selector,
        data: {
            json: data,
            keys: {
                x: 'key',
                value: ['values']
            },
            type: 'bar',
            names: {
                values: y_label
            }
        },
        legend: {
            show: false
        },
        axis: {
            x: {
                type: x_axis_type,
                label: {
                    position: 'outer-center',
                    text: x_label
                }
            },
            y: {
                label: {
                    position: 'outer-top',
                    text: y_label
                }
            }
        },
        bar: {
            width: {
                ratio: 0.5
            }
        }
    });
}

d3.json('/data/chromebook_specs.json', function(error, data){

    document.getElementById('cb-count').innerHTML = data.length;

    // releases per year
    var releases = d3.nest()
        .key(function(d) { return d.released.slice(0, 4); }).sortKeys(d3.ascending)
        .rollup(rollupSpec)
        .entries(filterSpec(data, 'released'));
    bar('#releases', releases, 'Year', y_axis_label);

    // brands distribution
    var all_brands = d3.nest()
        .key(function(d) { return d.brand[0]; })
        .sortKeys(d3.ascending)
        .rollup(rollupSpec)
        .entries(filterSpec(data, 'brand'));

    // Group brands with only 1 model as others
    var other = 0,
        brands = [];
    for (idx in all_brands) {
        var brand = all_brands[idx];
        if  (brand.values > 1) {
            brands.push(brand);
        } else {
            other++;
        }
    }
    brands.push({key: 'Other', values: other});

    bar('#brands', brands, 'Brands', y_axis_label);

    // RAM distribution
    var ram = d3.nest()
        .key(function(d) { return ~~(+d.ram_installed / 1024); })
        .sortKeys(ascNum)
        .rollup(rollupSpec)
        .entries(filterSpec(data, 'ram_installed'))
    bar('#ram', ram, 'RAM in GB', y_axis_label);

    // storage distribution
    var storage = d3.nest(data, 'storage')
        .key(function(d) { return d.storage; })
        .sortKeys(ascNum)
        .rollup(rollupSpec)
        .entries(filterSpec(data, 'storage'))
    bar('#storage', storage, 'Storage in GB', y_axis_label);

    // screen size distribution
    var sizes = nestFloatSpec(data, 'screen_size');
    bar('#sizes', sizes, 'Screen size in inch', y_axis_label, 'indexed');

    // clock rate distribution
    var clockrates = d3.nest()
        .key(function(d) { return +d.clock_rate / 1000; })
        .sortKeys(ascNum)
        .rollup(rollupSpec)
        .entries(filterSpec(data, 'clock_rate'));
    bar('#clockrates', clockrates, 'Clock rate in GHz', y_axis_label, 'indexed');

    // battery life distribution
    var batterylife = nestFloatSpec(data, 'battery_life');
    bar('#batterylife', batterylife, 'Battery life in hours', y_axis_label, 'indexed');

    // weight distribution
    var weights = nestFloatSpec(data, 'weight');
    bar('#weights', weights, 'Weight in lbs', y_axis_label, 'indexed');
});