window.onload = function () {
    cd = document.getElementById('code');
    code = cd.value;
    chart = flowchart.parse(code);
    chart.drawSVG('diagram');
};