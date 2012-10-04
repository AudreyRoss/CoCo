<?php
	include 'functions.php';
	
	$stud = new student(1, 'fall'); //Student ID, Quarter
	if (isset($_GET['quarter'])) { $stud->changeQuarter($_GET['quarter']);}
	if (isset($_GET['sort'])) {$sort = $_GET['sort'];}
	else { $sort = "dept";}
	if (isset($_GET['fav'])) { $stud->toggleFavorite($_GET['fav']);}
	if (isset($_GET['take'])) { $stud->toggleClass($_GET['take']);}
	
	$stud->viewDegree(true);
	
	echo '<h3>Favorites</h3>
	<div id = "favorites">';
		$stud->viewFav();
	echo '</div>
	<h3>Recommendations</h3>
	<div id = "recommendations">';
		$stud->viewRec();
	echo '</div>
	<h3>All Available Courses</h3>
	<div id = "courselist">';
		$stud->viewCourses();
	echo '</div>';
?>