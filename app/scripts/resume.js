(function($) {
  "use strict"; // Start of use strict

  // Bootstrap Tooltips
  $('[data-toggle="tooltip"]').tooltip();

  // Toggle lang
  $('[data-toggle="lang"]').click(function(event) {
    event.preventDefault();
    $('html').attr('lang', $(this).attr('data-lang'));
  });

  // Auto-detect the best lang setting
  const params = new URLSearchParams(window.location.search);

  if (params.has('lang')) {
    $('html').attr('lang', params.get('lang'));
  } else if (navigator.language.match(/^(en|fr)/)) {
    $('html').attr('lang', navigator.language.substr(0, 2))
  }

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#sideNav'
  });

})(jQuery); // End of use strict
