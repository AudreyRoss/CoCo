$(document).ready(function() {
	// Expand/Collapse All
	$('#example1 .expand_all').click(function() {
		$('.menu1 > li > a.collapsed').addClass('expanded').removeClass('collapsed').parent().find('> ul').slideDown('medium');
	});
	$('#example1 .collapse_all').click(function() {
		$('.menu1 > li > a.expanded').addClass('collapsed').removeClass('expanded').parent().find('> ul').slideUp('medium');
	});
	// Slide
	$(".menu1 > li > a.expanded + ul").slideToggle("medium");
	$(".menu1 > li > a").click(function() {
		$(this).toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
	});
	$(".menu1 > li > a").toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");

	// Fade
	$("#menu2 > li > a.expanded + ul").fadeIn("normal");
	$("#menu2 > li > a").click(function() {
		var el = $(this).parent().find('> ul');

		if($(this).hasClass("collapsed"))
			$(el).fadeIn('normal');
		else
			$(el).fadeOut('normal');

		$(this).toggleClass("expanded").toggleClass("collapsed");
	});

	// Grow/Shrink
	$("#menu3 > li > a.expanded + ul").show("normal");
	$("#menu3 > li > a").click(function() {
		$(this).toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').toggle("normal");
	});

	// Appear/Disappear
	$("#menu4 > li > a.expanded + ul").show();
	$("#menu4 > li > a").click(function() {
		$(this).toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').toggle();
	});

	// Accordion
	$("#menu5 > li > a.expanded + ul").slideToggle("medium");
	$("#menu5 > li > a").click(function() {
		$("#menu5 > li > a.expanded").not(this).toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
		$(this).toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
	});
	
	// Pointer cursor on hover.
	$(".menu1 > li > a").mouseover(function() {
		document.body.style.cursor = "pointer";
	});
	
	$(".menu1 > li > a").mouseout(function() {
		document.body.style.cursor = "default";
	});
});
