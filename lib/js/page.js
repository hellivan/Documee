$(function(){

	wow = new WOW(
	    {
	      boxClass:     'wow',      // default
	      animateClass: 'animated', // default
	      offset:       0,          // default
	      mobile:       false,       // default
	      live:         true        // default
	    }
	);

	wow.init();

	$('a[href^=#]').on('click', function(e){
    var href = $(this).attr('href');
    $('html, body').animate({
        scrollTop:$(href).offset().top}, 1000, 'easeInOutExpo');
    e.preventDefault();
	});

});
