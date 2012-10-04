<!DOCTYPE html>

<html>
<head>
    <title>Course Advisor</title>
    <link rel="stylesheet" href="stylesheet v2.css">
    <script src="kinetic-v3.8.2.min.js" type="text/javascript"></script>
    <script src="yacs_js_kinetic.js" type="text/javascript"></script>
    <script src="jquery-1.7.1.min.js" type="text/javascript"></script>
	<script type="text/javascript" src="listfunc.js"></script>
    <?php include 'functions.php'; ?>
</head>

<body>

<?php $stud = new student(1, 'fall'); ?>

<div id = "preload">
    <img src="quarter-left.png" id="quarter-left">
    <img src="quarter-right.png" id="quarter-right">
    <img src="collapse-left.png" id="collapse-left">
    <img src="collapse-right.png" id="collapse-right">
	<img src="loading.gif" id="loading">
	
	<img src="banner_fall-left.png" id="banner-fall-left">
	<img src="banner_spring-left.png" id="banner-spring-left">
	<img src="banner_spring-right.png" id="banner-spring-right">
	<img src="banner_summer-center.png" id="banner-summer-center">
	<img src="banner_summer-left.png" id="banner-summer-left">
	<img src="banner_winter.png" id="banner-winter-right">
</div>

<div id = "tooltip">
</div>

<div id = "saved-prompt">
	<h3>Saved!<h3>
</div>

<div id = "degree-requirements" class = "left-panel-screen">
	<h3>Degree Requirements</h3>
	<div id = "degree-requirements-list">
		<?php $stud->viewDegree(); ?>
	</div>
	<h3>Options</h3>
	<div id = "degree-requirements-options">
		<ul>
			<li onClick="openChangeMajorMinorPanel();">Change Major/Minor</li>
			<li onClick="openPetitionAClassPanel();">Petition a Class</li>
		</ul>
	</div>
</div>

<div id = "change-major-minor" class = "left-panel-screen">
	<h3>Current Major/Minor</h3>
	<div id = "current-major-minor"></div>
	<h3>Available Majors/Minors</h3>
	<div id = "available-majors-minors">
	<ul class="menu1">
	<li><a class="collapsed">Majors</a>
    <ul class="menu1 major-menu">
 
        <li><a class="collapsed">Bienen School of Music</a>
        <ul class="menu1 inner-menu">
            <li>Baritone/Bass</li>
            <li>Bassoon</li>
            <li>Cello</li>
            <li>Clarinet</li>
            <li>Classical Guitar</li>
            <li>Double Bass</li>
            <li>Euphonium</li>
            <li>Flute</li>
            <li>Harp</li>
            <li>Horn</li>
            <li>Jazz Studies</li>
            <li>Mezzo/Alto</li>
            <li>Music Cognition</li>
            <li>Music Composition</li>
            <li>Music Education</li>
            <li>Musicology</li>
            <li>Music Theory</li>
            <li>Oboe</li>
            <li>Percussion</li>
            <li>Piano</li>
            <li>Saxophone</li>
            <li>Soprano</li>
            <li>Tenor</li>
            <li>Trombone</li>
            <li>Trumpet</li>
            <li>Tuba</li>
            <li>Viola</li>
            <li>Violin</li>
        </ul>
        </li>
        <li><a class="collapsed">School of Communication</a>
        <ul class="menu1 inner-menu">
        <li>Communication Studies</li>
        <li>Dance</li>
        <li>Human Communication Sciences</li>
        <li>Performance Studies</li>
        <li>Radio/Television/Film</li>
        <li>Theatre</li>
        </ul>
        </li>
        <li><a class="collapsed">School of Education and Social Policy</a>
        <ul class="menu1 inner-menu">
        <li>Human Development and Psychological Services</li>
        <li>Learning and Organizational Change</li>
        <li>Secondary Teaching</li>
        <li>Social Policy</li>
        </ul>
        </li>
        
<li><a class="collapsed">McCormick School of Engineering</a>
        <ul class="menu1 inner-menu">
            <li>Applied Mathematics</li>
            <li>Biomedical Engineering</li>
            <li>Chemical and Biological Engineering</li>
            <li>Civil Engineering</li>
            <li>Computer Engineering</li>
            <li>Computer Science</li>
            <li>Electrical Engineering</li>
            <li>Environmental Engineering</li>
            <li>Industrial Engineering</li>
            <li>Manufacturing and Design Engineering</li>
            <li>Material science and Engineering</li>
            <li>Mechanical Engineering</li>
        </ul>
    </li>
        
    <li><a class="collapsed">Weinberg College of Arts and Sciences</a>
        <ul class="menu1 inner-menu">
            <li>African American Studies</li>
            <li>American Studies</li>
            <li>Anthropology</li>
            <li>Art History</li>
            <li>Art Theory and Practice</li>
            <li>Asian Language and Civilizations</li>
            <li>Asian Studies</li>
            <li>Biological Sciences</li>
            <li>Chemistry</li>
            <li>Classics</li>
            <li>Cognitive Science</li>
            <li>Comparitive Literature Studies</li>
            <li>Drama</li>
            <li>Earth and Planetary Sciences</li>
            <li>Economics</li>
            <li>English</li>
            <li>Environmental Sciences</li>
            <li>French</li>
            <li>Gender Studies</li>
            <li>Geography</li>
            <li>German</li>
            <li>History</li>
        </ul>
    </li>
    
    <li><a class="collapsed">Medill School of Journalism</a><br />
    <ul class="menu1 inner-menu">
        <li>Journalism</li>
    </ul>
    </li>
    
    </ul>
    </li>
        <li><a class="collapsed">Minors</a>
        <ul class="menu1 minor-menu">
            <li><a class="collapsed">Weinberg College of Arts and Sciences</a>
            <ul class="menu1 inner-menu">
                <li>Asian Studies</li>
                <li>English</li>
                <li>French</li>
                <li>History</li>
                <li>Middle East Studies</li>
            </ul>
            </li>    
            
            
            <li><a class="collapsed">School of Communication</a>
            <ul class="menu1 inner-menu">
                <li>Film and Media Studies</li>
            </ul>
            </li>
        </li>
		</ul>
	</ul></div>
	<h3>Options</h3>
	<div id = "majors-minors-options">
		<ul>
			<li onClick = "openDegreeRequirementsPanel();">Degree Requirements</li>
		</ul>
	</div>
</div>

<div id = "petition-a-class" class = "left-panel-screen">
	<h3>Petition</h3>
	<div id = "petition"></div>
	<h3>For</h3>
	<div id = "petition-for"></div>
	<h3>Options</h3>
	<div id = "petition-options">
		<ul>
			<li onClick = "petition();" style="font-size: 2em;" id="petition-save">Save</li>
			<li onClick = "openDegreeRequirementsPanel();" id="petition-cancel">Cancel</li>
		</ul>
	</div>
</div>

<div id = "schedule-container">
<table id = "schedule">
	<tr class = "dont-add-to-me">
		<td></td>
		<td>Monday</td>
		<td>Tuesday</td>
		<td>Wednesday</td>
		<td>Thursday</td>
		<td>Friday</td>
	</tr>
	<tr>
		<td>8:00</td>
	</tr>
	<tr>
		<td>8:30</td>
	</tr>
	<tr>
		<td>9:00</td>
	</tr>
	<tr>
		<td>9:30</td>
	</tr>
	<tr>
		<td>10:00</td>
	</tr>
	<tr>
		<td>10:30</td>
	</tr>
	<tr>
		<td>11:00</td>
	</tr>
	<tr>
		<td>11:30</td>
	</tr>
	<tr>
		<td>12:00</td>
	</tr>
	<tr>
		<td>12:30</td>
	</tr>
	<tr>
		<td>1:00</td>
	</tr>
	<tr>
		<td>1:30</td>
	</tr>
	<tr>
		<td>2:00</td>
	</tr>
	<tr>
		<td>2:30</td>
	</tr>
	<tr>
		<td>3:00</td>
	</tr>
	<tr>
		<td>3:30</td>
	</tr>
	<tr>
		<td>4:00</td>
	</tr>
	<tr>
		<td>4:30</td>
	</tr>
	<tr>
		<td>5:00</td>
	</tr>
</table>
</div>

<div id = "available-courses">
	<h3>Favorites</h3>
	<div id = "favorites">
		<?php $stud->viewFav(); ?>
	</div>
	<h3>Recommendations</h3>
	<div id = "recommendations">
		<?php $stud->viewRec(); ?>
	</div>
	<h3>All Available Courses</h3>
	<div id = "courselist">
		<?php $stud->viewCourses(); ?>
	</div>
</div>

<div id = "wrapper">
    
	<div id = "menu-container-container">
	<div id = "menu-container">
    <div id = "menu">
		<ul>
			<li><img onClick = "openDegreeRequirementsPanel();" src="degreq.png" title="View Degree Requirements" width="32" height="32"></li>
			<li><img onClick = "openChangeMajorMinorPanel();" src="major.png" title="Change Major/Minor" width="32" height="32"></li>
			<li><img onClick = "openPetitionAClassPanel();" src="petition.png" title="Petition a Class" width="32" height="32"></li>
			<li><img onClick = "suggestClasses();" src="sugclass.png" title="Suggest Me Classes" width="32" height="32"></li>
			<li><img onClick = "openAvailableCoursesPanel();" src="viewcourse.png" title="View Available Courses" width="32" height="32"></li>
			<li><img onclick = "window.print();" src="print.png" title="Print" width="32" height="32"></li>
			<li><img onClick = "showSavedPrompt(panels.center);" src="save.png" title="Save" width="32" height="32"></li>
			<li><img onClick = "saveAndLogOff();" src="savelog.png" title="Save & Logoff" width="32" height="32"></li>
			<li><img onClick = "window.location.href='index.html';" src="logoff.png" title="Logoff" width="32" height="32"></li>
		</ul>
    </div> <!-- #menu -->
	</div>
	</div>
    
    <div id="main-window"></div>
    
</div> <!-- #wrapper -->

</body>
</html>
