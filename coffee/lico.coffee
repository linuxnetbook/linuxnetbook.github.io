f = d3.format('.02f')
selected_map = 'users_by_pop'
scheme = colorbrewer.Blues[9]
factor = 100000

quantize = (min_val, max_val)->
    d3.scale.quantize()
        .domain([min_val, max_val])
        .range(d3.range(scheme.length).map((i)-> scheme[i]))


draw = (geo, lico, country_index, min_users, max_users, min_users_by_pop, max_users_by_pop)->
    color = (country)->
        color_val = '#eee'
        idx = country_index[country.id]
        if idx and lico[idx].pop_count > 0
            if 'users_by_pop' == selected_map
                color_val = quantize(min_users_by_pop, max_users_by_pop) lico[idx].user_count / lico[idx].pop_count
            else
                color_val = quantize(min_users, max_users) lico[idx].user_count
        color_val

    title = (country)->
        idx = country_index[country.id]
        if idx
            if 'users_by_pop' == selected_map
                lico[idx].name + ': ' + f(factor * lico[idx].user_count / lico[idx].pop_count)
            else
                lico[idx].name + ': ' + f(lico[idx].user_count)

    selector = '#map'
    width = (parseInt d3.select(selector).style('width'), 10) - 150
    height = width * .48

    map.init geo, {
        colorize: color,
        selector: selector,
        width: width,
        height: height,
        title: title,
        format: f
    }
    map.draw()

    if 'users_by_pop' == selected_map
        map.legend(factor * min_users_by_pop, factor * max_users_by_pop, scheme)
    else
        map.legend(min_users, max_users, scheme)


init = (error, geo, lico) ->
    min_users = 0
    max_users = 0
    min_users_by_pop = 0
    max_users_by_pop = 0

    country_index = {}
    for idx, country of lico
        country_index[country['iso3']] = idx

        if country.user_count > max_users
            max_users = country.user_count
        if country.user_count < min_users
            min_users = country.user_count

        # only consider countries with a minimum population, to get rid of
        # outliers like Pitcairn
        continue if country.pop_count < 1000000

        by_pop = country.user_count / country.pop_count
        if by_pop > max_users_by_pop
            max_users_by_pop = by_pop
        if by_pop < min_users_by_pop
            min_users_by_pop = by_pop

    draw(geo, lico, country_index, min_users, max_users, min_users_by_pop, max_users_by_pop)

    d3.select('#map-select')
        .on('change', ()->
            selected_map = this.value
            draw(geo, lico, country_index, min_users, max_users, min_users_by_pop, max_users_by_pop)
        )


queue()
    .defer(d3.json, '/geo/countries.json')
    .defer(d3.json, '/data/lico.json')
    .await(init)