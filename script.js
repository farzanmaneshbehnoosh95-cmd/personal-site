(function () {
  // Example scores only. They are not data from the real project.
  var items = [
    { name: 'Holding Incentive', r: 7, i: 8, c: 60, e: 6 },
    { name: 'Post-Sale Choice Screen', r: 8, i: 6, c: 70, e: 3 },
    { name: 'Targeted Notification', r: 6, i: 4, c: 80, e: 2 }
  ];
  var fields = [
    { k: 'r', label: 'Reach', min: 1, max: 10, step: 1, suffix: '' },
    { k: 'i', label: 'Impact', min: 1, max: 10, step: 1, suffix: '' },
    { k: 'c', label: 'Confidence', min: 10, max: 100, step: 10, suffix: '%' },
    { k: 'e', label: 'Effort', min: 1, max: 10, step: 1, suffix: '' }
  ];
  var defaults = JSON.parse(JSON.stringify(items));
  var list = document.getElementById('rank');
  var status = document.getElementById('rank-status');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = {};

  function score(it) { return (it.r * it.i * (it.c / 100)) / it.e; }

  function build() {
    items.forEach(function (it, idx) {
      var li = document.createElement('li');
      li.className = 'card';
      li.dataset.name = it.name;
      var html = '<div class="score"><span></span><small>RICE score</small></div><div><h3>' + it.name + '</h3><div class="sliders">';
      fields.forEach(function (f) {
        var id = 'f' + idx + f.k;
        html += '<label for="' + id + '">' + f.label + '<output id="o' + id + '"></output>' +
          '<input id="' + id + '" type="range" data-k="' + f.k + '" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" value="' + it[f.k] + '"></label>';
      });
      html += '</div></div>';
      li.innerHTML = html;
      li.addEventListener('input', function (ev) {
        var k = ev.target.dataset.k;
        if (!k) return;
        it[k] = Number(ev.target.value);
        render(true);
      });
      nodes[it.name] = li;
    });
  }

  function render(animate) {
    var before = {};
    if (animate && !reduce) {
      Object.keys(nodes).forEach(function (n) { before[n] = nodes[n].getBoundingClientRect().top; });
    }
    var sorted = items.slice().sort(function (a, b) { return score(b) - score(a); });
    sorted.forEach(function (it) {
      var li = nodes[it.name];
      li.querySelector('.score span').textContent = score(it).toFixed(1);
      fields.forEach(function (f) {
        var out = li.querySelector('#o' + li.querySelector('[data-k="' + f.k + '"]').id);
        out.textContent = it[f.k] + f.suffix;
      });
      list.appendChild(li);
    });
    if (animate && !reduce) {
      sorted.forEach(function (it) {
        var li = nodes[it.name];
        var dy = before[it.name] - li.getBoundingClientRect().top;
        if (!dy) return;
        li.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 320, easing: 'ease-out' });
      });
    }
    status.textContent = 'Ranking: ' + sorted.map(function (s) { return s.name; }).join(', then ');
  }

  document.getElementById('reset').addEventListener('click', function () {
    items.forEach(function (it, idx) {
      fields.forEach(function (f) {
        it[f.k] = defaults[idx][f.k];
        nodes[it.name].querySelector('[data-k="' + f.k + '"]').value = defaults[idx][f.k];
      });
    });
    render(true);
  });

  build();
  render(false);
  document.getElementById('year').textContent = new Date().getFullYear();
})();
