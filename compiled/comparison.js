"use strict";

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var slugs;
// Example: /comparison/?p=toshiba-cb35-b3330-chromebook-2-vs-toshiba-cb35-b3340-chromebook-2
if (slugs = document.location.search.slice(3).split('-vs-')) {
  fetch('/data/chromebook_specs.json').then(function (resp) {
    return resp.json();
  }).then(function (data) {
    var specs = [];
    var _iterator = _createForOfIteratorHelper(data),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var spec = _step.value;
        if (slugs.includes(spec.url.replaceAll('/', ''))) {
          specs.push(spec);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    specs && show(specs);
  });
}
function formatDate(s) {
  var d = new Date(s);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
function row(values, label) {
  var element = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'td';
  var content_type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'text';
  var tr = document.createElement('tr');
  var cell = document.createElement('th');
  cell.textContent = label;
  tr.appendChild(cell);
  var _iterator2 = _createForOfIteratorHelper(values),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var value = _step2.value;
      var value_cell = document.createElement(element);
      if (content_type == 'text') {
        value_cell.textContent = value;
      } else if (content_type == 'html') {
        value_cell.innerHTML = value;
      }
      tr.appendChild(value_cell);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return tr;
}
function show(specs) {
  var thead = document.getElementsByTagName('thead')[0];
  var tbody = document.getElementsByTagName('tbody')[0];
  thead.appendChild(row(specs.map(function (spec) {
    return "<a href=\"".concat(spec.url, "\">").concat(spec.title, "<br><img src=\"/img/preview/").concat(spec.image.filename, "\" alt=\"Laptop Preview\"></a>");
  }), '', 'th', 'html'));
  tbody.appendChild(row(specs.map(function (spec) {
    return "".concat(spec.screen_size, "\" ").concat(spec.display_type);
  }), 'Display Size and Type'));
  tbody.appendChild(row(specs.map(function (spec) {
    return "".concat(spec.max_resolution, " pixels");
  }), 'Max. Resolution'));
  tbody.appendChild(row(specs.map(function (spec) {
    return spec.touchscreen ? 'Yes' : 'No';
  }), 'Touch Screen'));
  tbody.appendChild(row(specs.map(function (spec) {
    return spec.clock_rate ? "".concat(spec.clock_rate / 1000, " GHz ").concat(spec.cpu) : spec.cpu;
  }), 'Processor'));
  tbody.appendChild(row(specs.map(function (spec) {
    return spec.cores;
  }), 'CPU Cores'));
  tbody.appendChild(row(specs.map(function (spec) {
    return "".concat(spec.width, " x ").concat(spec.depth, " x ").concat(spec.height);
  }), 'Dimensions (WxDxH)'));
  tbody.appendChild(row(specs.map(function (spec) {
    return "".concat(spec.weight, " lbs");
  }), 'Weight'));
  tbody.appendChild(row(specs.map(function (spec) {
    return spec.ram_installed ? "".concat(spec.ram_installed / 1024, " GB") : '';
  }), 'RAM Installed'));
  tbody.appendChild(row(specs.map(function (spec) {
    return "".concat(spec.storage, " GB ").concat(spec.storage_type);
  }), 'Storage'));
  tbody.appendChild(row(specs.map(function (spec) {
    return spec.battery_life ? "".concat(spec.battery_life, " hours") : '';
  }), 'Battery Life'));
  tbody.appendChild(row(specs.map(function (spec) {
    return spec.wlan;
  }), 'Wireless LAN'));
  tbody.appendChild(row(specs.map(function (spec) {
    return spec.input_devices.join(', ');
  }), 'Input Devices'));
  tbody.appendChild(row(specs.map(function (spec) {
    return spec.connectivity.join(', ');
  }), 'Connectivity'));
  tbody.appendChild(row(specs.map(function (spec) {
    return formatDate(spec.released);
  }), 'Released'));
}