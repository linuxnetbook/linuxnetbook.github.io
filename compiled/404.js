"use strict";

var parts = document.location.pathname.split('/');
if (parts.length > 2 && parts[1] == 'comparison') {
  document.location.href = "/comparison/?p=".concat(parts[2]);
}