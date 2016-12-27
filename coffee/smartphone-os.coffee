all_os = ['Bada', 'Android', 'iOS', 'RIM', 'Symbian', 'Windows Mobile', 'Windows Phone', 'Other']
timeline_os = ['Android', 'iOS', 'RIM', 'Symbian', 'Windows Phone']

csv = null
quarter_data = []
quarters_index = {}
selected_idx = null
selected_os_idx = 0
selected_quarter = []
timeline_data = []

# make sure colors are consistent across graphs
color_map = {}
os_colors =  d3.zip(all_os, d3.scale.category10().range())
for i in os_colors
    color_map[i[0]] = i[1]


get_os_color = (os)->
    if color_map.hasOwnProperty os
        return color_map[os]
    '#eeeeee'


int = (v)->
    parseInt v, 10


quarter_pie = ()->
    # calculate other smartphone value from OS with hightest share and total smartphone value
    selected_os = quarter_data[selected_os_idx]
    total_smartphones = int selected_quarter['Total Smartphones']
    other_os = total_smartphones - selected_os.value

    os_percentage = if selected_os.value then (100 / total_smartphones * selected_os.value) else 0
    other_percentage = if other_os then (100 / total_smartphones * other_os) else 0

    pie '#quarter-share', [
        {'label': selected_os.label, 'value': os_percentage},
        {'label': 'All else', 'value': other_percentage}
    ]

    so = d3.select('#select-os')
    so.selectAll('option').remove()
    so.selectAll('option')
        .data(quarter_data)
        .enter()
        .append('option')
        .attr('value', (d, i)-> i)
        .attr('selected', (d, i)-> if int(selected_os_idx) is i then 'selected' else null)
        .text((d)-> d.label)
    so.on 'change', ()->
        selected_os_idx = d3.event.target.value
        quarter_pie()


quarter_charts = ()->
    selected_quarter = csv[selected_idx]
    quarter_data = []
    for os in all_os
        val = int selected_quarter[os]
        if val
            quarter_data.push {'label': os, 'value': val}
    quarter_data.sort((a, b)-> d3.descending(a.value, b.value))

    bar '#quarter-all-os', [{'key': selected_quarter['Quarter'], 'values': quarter_data}]

    # must reset selected_os_idx before creating pie
    selected_os_idx = 0
    quarter_pie()


# set up event handlers
events = ()->
    d3.select('#select-chart-type').on 'change', ()->
        # remove to avoid overlaying charts
        d3.select('#timeline').selectAll('*').remove()
        timeline('#timeline', timeline_data, d3.event.target.value, get_os_color)

    sq = d3.select('#select-quarter')
    sq.selectAll('option')
        .data(d3.entries(quarters_index))
        .enter()
        .append('option')
        .attr('value', (d)-> d.value)
        .attr('selected', (d)-> if selected_idx is int d.value then 'selected' else null)
        .text((d)-> d.key)
    sq.on 'change', ()->
        selected_idx = d3.event.target.value
        quarter_charts()


init = (error, data)->
    csv = data
    values_by_os = {}

    # over time chart
    for os in timeline_os
        values_by_os[os] = []
    values_by_os['Other'] = []

    for idx, row of csv
        os_sum = 0
        quarters_index[row['Quarter']] = idx

        d = row.Date.split('-')
        date = new Date(int(d[0]), int(d[1]) - 1, int(d[2])).getTime()

        for os in timeline_os
            val = int row[os]
            os_sum += val
            values_by_os[os].push [date, val]
            #values_by_os[os].push {'x': date, 'y': val} # for multiBarChart

        other = int(row['Total Smartphones']) - os_sum
        values_by_os['Other'].push [date, other]

    for os, values of values_by_os
        timeline_data.push {'key': os, 'values': values}

    timeline('#timeline', timeline_data, 'area', get_os_color)

    # by default show latest quarter with data
    selected_idx = csv.length - 1
    quarter_charts()

    events()


queue()
    .defer(d3.csv, '/data/mobile-os-market-share.csv')
    .await(init)