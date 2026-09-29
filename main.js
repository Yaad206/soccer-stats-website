/* ==========================================================================
   ScoreDeck — shared behavior
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  initNavToggle();
  initSportFilter();
  initSortableTable();
  initChart();
  setFooterYear();
});

/* ---- Mobile nav toggle ---- */
function initNavToggle() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

/* ---- Sport filter (Teams / Players / Statistics pages) ---- */
function initSportFilter() {
  var select = document.getElementById("sport-filter");
  if (!select) return;

  var items = document.querySelectorAll("[data-sport]");
  var liveRegion = document.getElementById("filter-status");

  function applyFilter() {
    var chosen = select.value;
    var visibleCount = 0;

    items.forEach(function (item) {
      var matches = chosen === "all" || item.getAttribute("data-sport") === chosen;
      item.hidden = !matches;
      if (matches) visibleCount++;
    });

    if (liveRegion) {
      var noun = visibleCount === 1 ? "result" : "results";
      liveRegion.textContent = visibleCount + " " + noun + " shown.";
    }

    // If a statistics table is present, also filter its rows and re-render the chart
    var table = document.getElementById("stats-table");
    if (table) {
      updateChartFromTable();
    }
  }

  select.addEventListener("change", applyFilter);
  applyFilter();
}

/* ---- Accessible sortable table (Statistics page) ---- */
function initSortableTable() {
  var table = document.getElementById("stats-table");
  if (!table) return;

  var headers = table.querySelectorAll("thead th[data-sort-key]");

  headers.forEach(function (th) {
    var button = th.querySelector("button");
    if (!button) return;

    button.addEventListener("click", function () {
      var key = th.getAttribute("data-sort-key");
      var type = th.getAttribute("data-sort-type") || "text";
      var currentDirection = th.getAttribute("aria-sort");
      var newDirection = currentDirection === "ascending" ? "descending" : "ascending";

      headers.forEach(function (h) {
        h.setAttribute("aria-sort", "none");
      });
      th.setAttribute("aria-sort", newDirection);

      sortTableRows(table, key, type, newDirection);
    });
  });
}

function sortTableRows(table, key, type, direction) {
  var tbody = table.querySelector("tbody");
  var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));

  rows.sort(function (a, b) {
    var aVal = a.querySelector('[data-cell="' + key + '"]').getAttribute("data-value");
    var bVal = b.querySelector('[data-cell="' + key + '"]').getAttribute("data-value");

    if (type === "number") {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    }

    if (aVal < bVal) return direction === "ascending" ? -1 : 1;
    if (aVal > bVal) return direction === "ascending" ? 1 : -1;
    return 0;
  });

  rows.forEach(function (row) {
    tbody.appendChild(row);
  });

  updateChartFromTable();
}

/* ---- Simple accessible SVG bar chart driven by the statistics table ---- */
function initChart() {
  var table = document.getElementById("stats-table");
  if (!table) return;
  updateChartFromTable();
}

function updateChartFromTable() {
  var svg = document.getElementById("stat-chart");
  var table = document.getElementById("stats-table");
  if (!svg || !table) return;

  var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr")).filter(function (row) {
    return !row.hidden;
  });

  // Chart the first numeric stat column found (data-chart="true")
  var chartCell = "wins";
  var labelCell = "team";

  var data = rows.slice(0, 8).map(function (row) {
    var labelEl = row.querySelector('[data-cell="' + labelCell + '"]');
    var valueEl = row.querySelector('[data-cell="' + chartCell + '"]');
    return {
      label: labelEl ? labelEl.textContent.trim() : "",
      value: valueEl ? parseFloat(valueEl.getAttribute("data-value")) : 0
    };
  });

  renderBarChart(svg, data);
}

function renderBarChart(svg, data) {
  var width = 640;
  var height = 260;
  var padding = { top: 20, right: 20, bottom: 60, left: 40 };
  var chartWidth = width - padding.left - padding.right;
  var chartHeight = height - padding.top - padding.bottom;

  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("role", "img");

  var maxValue = Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1]));
  var barCount = data.length || 1;
  var barSlot = chartWidth / barCount;
  var barWidth = Math.min(56, barSlot * 0.6);

  var summary = data.map(function (d) {
    return d.label + ": " + d.value + " wins";
  }).join(", ");
  svg.setAttribute("aria-label", "Bar chart of team wins. " + summary);

  var svgNS = "http://www.w3.org/2000/svg";
  svg.innerHTML = "";

  // Axis line
  var axis = document.createElementNS(svgNS, "line");
  axis.setAttribute("x1", padding.left);
  axis.setAttribute("y1", height - padding.bottom);
  axis.setAttribute("x2", width - padding.right);
  axis.setAttribute("y2", height - padding.bottom);
  axis.setAttribute("stroke", "#dadfe5");
  svg.appendChild(axis);

  data.forEach(function (d, i) {
    var barHeight = maxValue > 0 ? (d.value / maxValue) * chartHeight : 0;
    var x = padding.left + i * barSlot + (barSlot - barWidth) / 2;
    var y = height - padding.bottom - barHeight;

    var rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("class", "bar");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", Math.max(barHeight, 1));
    rect.setAttribute("tabindex", "0");
    var titleEl = document.createElementNS(svgNS, "title");
    titleEl.textContent = d.label + ": " + d.value + " wins";
    rect.appendChild(titleEl);
    svg.appendChild(rect);

    var valueLabel = document.createElementNS(svgNS, "text");
    valueLabel.setAttribute("x", x + barWidth / 2);
    valueLabel.setAttribute("y", y - 6);
    valueLabel.setAttribute("text-anchor", "middle");
    valueLabel.setAttribute("font-size", "13");
    valueLabel.setAttribute("font-weight", "700");
    valueLabel.textContent = d.value;
    svg.appendChild(valueLabel);

    var nameLabel = document.createElementNS(svgNS, "text");
    nameLabel.setAttribute("x", x + barWidth / 2);
    nameLabel.setAttribute("y", height - padding.bottom + 18);
    nameLabel.setAttribute("text-anchor", "middle");
    nameLabel.setAttribute("font-size", "11");
    wrapSvgText(nameLabel, d.label, 4, x + barWidth / 2, height - padding.bottom + 18);
    svg.appendChild(nameLabel);
  });
}

function wrapSvgText(textEl, label, maxWordsIgnored, x, y) {
  var words = label.split(" ");
  var svgNS = "http://www.w3.org/2000/svg";
  textEl.textContent = "";
  words.forEach(function (word, idx) {
    var tspan = document.createElementNS(svgNS, "tspan");
    tspan.setAttribute("x", x);
    tspan.setAttribute("dy", idx === 0 ? 0 : 12);
    tspan.textContent = word;
    textEl.appendChild(tspan);
  });
}

/* ---- Footer year ---- */
function setFooterYear() {
  var el = document.getElementById("footer-year");
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}
