---
---
require([
  '/public/js/jquery-2.1.1.min.js',
  '/public/js/lunr.min.js',
], function (_, lunr) {

  var docs =
  [
  {% for page in site.pages %}
      {% unless page.exclude_from_search %}
        {% include page.json %},
      {% endunless %}
  {% endfor %}
  ];
  // init lunr
  var idx = lunr(function () {
    this.field('title', {boost: 10});
    this.field('content');
    this.ref('id');
  });

  // add each document to be index
  for(var index in docs) {
    idx.add(docs[index]);
  }

  var originalContent = {
    selector : '.page',
  };
  originalContent.content = $(originalContent.selector).html();
  originalContent.reset = function() {
    $(originalContent.selector).html(originalContent.content);
  };

  var debounce = function (fn) {
    var timeout;
    return function () {
      var args = Array.prototype.slice.call(arguments),
          ctx = this;

      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(ctx, args);
      }, 100);
    };
  };

  // Run a query as the user types
  $('#search').bind('input', debounce(function (e) {
    var query = $(this).val();
    if (query < 1) {
      originalContent.reset();
      return;
    }
    render( prepare( query ) );
  }))

  // Load the top result if the user hits enter
  $('.search-form').bind('submit', function(e) {
    window.location.href = idx.latestEntries[0].id;
    e.preventDefault();
  });

  function prepare( query ) {
    var entries = idx.search(query).map(function (result) {
      return docs.filter(function (q) { return q.id === result.ref })[0]
    })
    idx.latestEntries = entries;
    return entries;
  }

  function render( entries ) {
    var output = '';
    if (entries.length == 0) {
      output = '<h2 class="minor-text">Nothing found</h2>';
    }
    for(var index in entries) {
      entry = entries[index];
      output += '<div class="search-result">';
      output += '<a href="' + entry.id + '">';
      output += '<h2 class="search-result__title">';
      output += entry.title;
      output += '</h2>';
      output += '</a>';
      output += '</div>';
    }

    $(originalContent.selector).html( output );
  }

});
