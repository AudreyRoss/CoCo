<?php
	include 'functions.php';
	
	$stud = new student(1, 'fall'); //Student ID, Quarter
	if (isset($_GET['quarter'])) { $stud->changeQuarter($_GET['quarter']);}
	if (isset($_GET['sort'])) {$sort = $_GET['sort'];}
	else { $sort = "dept";}
	if (isset($_GET['fav'])) { $stud->toggleFavorite($_GET['fav']);}
	if (isset($_GET['take'])) { $stud->toggleClass($_GET['take']);}
	
	$stud->viewFav();
?>