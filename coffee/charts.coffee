format_date = d3.time.format('%x')
format_int = d3.format(',d')


# this is a bit ugly
set_dim = (elt, ratio)->
    width = elt.style('width').replace('px', '')
    height = width * ratio
    elt.style('width', width).style('height', height)


timeline = (selector, data, chart_type, colorize)->
    chart = nv.models.lineChart()
    if chart_type is 'area'
        chart = nv.models.stackedAreaChart()

    svg = d3.select(selector)
    set_dim(svg, .36)

    nv.addGraph ()->
        chart
            .x((d)-> d[0])
            .y((d)-> d[1])
            .color((d)-> colorize d.key)
            .useInteractiveGuideline(true)

        chart.xAxis
            .showMaxMin(false)
            .tickFormat((d)-> format_date(new Date(d)))

        chart.yAxis
            .tickFormat(d3.format(',d'))

        svg.datum(data)
            .transition().duration(500)
            .call(chart)
        chart


bar = (selector, data)->
    svg = d3.select(selector)
    set_dim(svg, .4)

    nv.addGraph ()->
        chart = nv.models.discreteBarChart()
            .x((d) -> d.label)
            .y((d) -> d.value)
            .staggerLabels(true)
            .tooltips(false)
            .showValues(true)
            .valueFormat((d)-> format_int(d))
            .color((d)-> '#1f77b4')

        chart.yAxis
            .tickFormat(d3.format(',d'))

        d3.select(selector)
            .datum(data)
            .transition().duration(500)
            .call(chart)

        chart


pie = (selector, data)->
    svg = d3.select(selector)
    set_dim(svg, .94)

    nv.addGraph ()->
        chart = nv.models.pieChart()
            .x((d) -> d.label)
            .y((d) -> d.value)
            .showLegend(false)
            .showLabels(true)
            .tooltipContent((key, y, e, graph)->
                '<h3>' + key + '</h3>' + '<p>' +  y + '%</p>')

        d3.select(selector)
            .datum(data)
            .transition().duration(500)
            .call(chart)

        chart


bar_image = (selector, data, key, order)->
    svg = d3.select(selector)
    bar_h = 50

    if not order
        order = 'descending'

    bar_w = ~~svg.style('width').replace('px', '') - (bar_h * 2) - 10

    func_id = (d, i)-> d.url
    func_title = (d)-> d.title + '\nClick to open product page.'
    func_click = (d)-> window.open(d.url)

    bar_data = data
        .filter((d)-> d[key])
        .sort((a, b) -> d3[order](a[key], b[key])).slice(0, 5)

    scale_x = d3.scale.linear()
        .domain([0, d3.max bar_data, (d)-> d[key]])
        .range([0, bar_w])

    rects = svg.selectAll('rect')
        .data(bar_data, func_id)

    rects.enter().append('rect')
        .on('click', func_click)
        .append('title').text(func_title)

    rects
        .attr('width', (d)-> scale_x(d[key]))
        .attr('height', bar_h - 20)
        .attr('x', bar_h + 5)
        .attr('y', (d, i) -> i * bar_h + 8)

    rects.exit().remove()

    labels = svg.selectAll('image')
        .data(bar_data, func_id)

    labels.enter().append('svg:image')
        .attr('xlink:href', (d) -> d.img_src)
        .attr('width', bar_h)
        .attr('height', bar_h)
        .attr('x', 0)
        .attr('y', (d, i) -> i * bar_h)
        .on('click', func_click)
        .append('title').text(func_title)

    labels.exit().remove()

    texts = svg.selectAll('text')
        .data(bar_data, func_id)

    texts.enter().append('text')
        .attr('x', bar_h * 2 + bar_w)
        .attr('y', (d, i) -> i * bar_h)
        .attr('dy', '2.2em')
        .attr('text-anchor', 'end')
        .text((d)-> d[key])

    texts.exit().remove()