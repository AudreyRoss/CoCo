<?php
session_start();

include('connectDB.php');

$light = "ffffff";
$dark = "dce8cd";

function ar_index($obj, $arr, $length = NULL) {
	if (is_array($arr)) {
		if (!$length) {$length = count($arr);}
		for ($ii = 0; $ii < $length; $ii++) {
			if (strcasecmp($arr[$ii], $obj) == 0) {
				return $ii;
			}
		}
	}
	return -1;
}

function getCourseName($classid) {
 $query = "SELECT * FROM hci_ca_reqs WHERE id=\"".$classid."\"";
 $result = mysql_query($query) or die(mysql_error());
 while($row = mysql_fetch_assoc($result)) {
  return $row['class'];
 }
}

function getCourseNameB($classid) {
 $query = "SELECT * FROM hci_ca_courses WHERE id=\"".$classid."\"";
 $result = mysql_query($query) or die(mysql_error());
 while($row = mysql_fetch_assoc($result)) {
  return $row['name'];
 }
}

function getCourseID($classname) {
 $query = "SELECT * FROM hci_ca_reqs WHERE class=\"".$classname."\"";
 $result = mysql_query($query) or die(mysql_error());
 while($row = mysql_fetch_assoc($result)) {
  return $row['id'];
 }
}

function dayParse($dayString) { 
	$days = array(false,false,false,false, false,false);
	$dayString = 'z'.$dayString; 
	if (strpos($dayString, "Mo")) {
		$days [1] = true;
	}
	if (strpos($dayString, "Tu")) {
		$days [2] = true;
	}
	if (strpos($dayString, "We")) {
		$days [3] = true;
	}
	if (strpos($dayString, "Th")) {
		$days [4] = true;
	}
	if (strpos($dayString, "Fr")) {
		$days [5] = true;
	}
	return $days;
}


class student {
	/*	Course Advisor Functions
	 *	
	 *	void 			constructor($userid, $quarter)		Make object, fill variables
	 *	class			genClassLInk($class)				Generate the fav link and add class link and hovering text for a class
	 *  favlist			viewFav()							Generate & view Favorite Courses
	 *	reclist			viewRec()							generate * view Recommended Courses
	 *	void			viewCourses()						View All Available courses for the quarter
	 *	nattakenlist	genDegCourses($classlist, $catlist)	Generate list for degrees given an array of categories and a table of courses
	 *	nattakenlist	viewDegree()						Degree Progress on the left side
	 *	quarter			changeQuarter(direction)			Direction should be +/- 1 (me)
	 *	days			dayParse(string)					Parse days into a boolean array
	 *	
	 *
	 *	Need to be implemented
	 *	togglefav()					Add/remove class to/from favorites (Audrey)
	 *	toggleclass()				Add/remove class to/from schedule (Audrey )
	 *	suggestSchedule()			Generate schedule from nottakenlist and favlist. (Charlie)
	 *	changeMajor()				(Shannon)
	 *	changeMinor()				(Shannon)
	 *
	 */
 
	var $id;
	var $school;
	var $majors;
	var $minors;
	var $quarter;
	var $year;			//let 0 correspond to 2000
	var $schedule;		//id[][quarter][year]
	var $favlist;		//Class id's
	var $nottakenlist;	//Class names
	var $reclist;		//Class ids
	var $courselist; 	//Class ids for courses available this quarter.
	var $catlist; 
	var $taking;		//Class[][id, day, start, end]
	var $courseids;		//array of available course ids
	
	
	//Constructor~~
	function __construct($userid, $quarter) {
		$this->quarter = $quarter;
		if (isset($_GET['year'])) {$this->year = $_GET['year']; } else { $this->year = 2012; }
		$this->id = $userid;
		$this->schedule = array();
		
		$query = "SELECT * FROM hci_ca_users WHERE id=\"$userid\"";
		$result = mysql_query($query) or die(mysql_error());
		while($row = mysql_fetch_assoc($result)) {
			$this->majors = array($row['major1'], $row['major2']);
			$this->minors = array($row['minor1'], $row['minor2'], $row['minor3']);
			$this->school = $row['school'];
			$this->schedule = unserialize(html_entity_decode($row['schedule'], ENT_QUOTES));
			}
		$this->majors = array_filter($this->majors);
		$this->minors = array_filter($this->minors);
		
		
		if (isset($_SESSION['taking'])) {
			$this->taking = $_SESSION['taking'];
		} else {$this->taking = null;}
	}
	
	
	/************************************
	 *Utilities
	 ************************************/
	 function overlap($class1, $class2) {
		 //Check for existence
		if (!($class1) || !($class2)) {return false;}
		//Check for day overlap
		elseif ($class1['day'] & $class2['day'] == 0) {return false;}
		//Check for time overlap
		elseif (((strtotime($class1['start']) >= strtotime($class2['start'])) && 
		 	 (strtotime($class1['start']) <= strtotime($class2['end']))) ||
			 ((strtotime($class1['end']) >= strtotime($class2['start'])) && 
		 	 (strtotime($class1['end']) <= strtotime($class2['end']))) ) 
		{
			return true;
		} else {
			return false;
		}
	 }
	 
	 function checkQuarter($class) {
		$query = "SELECT * FROM hci_ca_courses WHERE id=\"".$class."\"";
		$result = mysql_query($query) or die(mysql_error());
		while($row = mysql_fetch_assoc($result)) {
			if (strnatcasecmp($row['quarter'], $this->quarter)==0) {
				return true;
			}
		}
		return false;
	 }
	 
	 function isTaking($class, $sesh = false) { 
	 /*
		 if ($sesh) { //echo count($_SESSION['taking']).'is count and isarray is '.is_array($_SESSION['taking']);
		 	if (is_array($_SESSION['taking'])) { //Something's probably broken here.
			 for ($ii = 0; $ii < count($_SESSION['taking']); $ii++) { ///echo 'sesh id: '.$ii.' something: '.$_SESSION['taking'][$ii]['id'].'<br />';
				 if ($_SESSION['taking'][$ii]['id'] == $class) {return $ii;}
			 }
			}

		 } //else {
			// for ($ii = 0; $ii < count($this->taking); $ii++) {
			//	 if ($this->taking[$ii]['id'] == $class) {return $ii;}
			// }
		 //} */
		 
		 if (isset($this->schedule[$this->year][$this->quarter][$class])) {
			return $this->schedule[$this->year][$this->quarter][$class];
		 }
		 
		 return -1;
	 }
	 

	
	/************************************
	 *Display Functions
	 ************************************/
	 
	//generate links and info for class listings
	function genClassLink($class, $block = false, $encodeHTML = false) {
		if (isset($_GET['quarter'])) {$qu = $_GET['quarter']; }
		else {$qu = 0;}
		$url = "functions.php?quarter=$qu";
		
		$query2 = "SELECT * FROM hci_ca_courses WHERE id=\"$class\"";
		$result2 = mysql_query($query2) or die(mysql_error());
		while($row2 = mysql_fetch_assoc($result2)) {
			$str = '<div class="full-class-div class-id-'.$class.'">';
			if(!$block) {
				if($this->isTaking($class, true) > -1) {$str = $str.'<div onClick="toggleClass('.$class.');" class="removeclass"></div>'; }
				else {$str = $str.'<div onClick="toggleClass('.$class.');" class="addclass"></div>';} 
				if (ar_index($class, $this->favlist) ==-1) {$str = $str.'<a onClick = "favoriteClass('.$class.');" class="faveoff"><img src="heartwhite.png" style="opacity: 0;"></a>  '; }
				else { $str = $str.'<a onClick = "favoriteClass('.$class.');" class="faveon"><img src="heartclear.png"></a>  '; }
			}
			
			$str = $str.'  <a class="class">'.trim(strtoupper($row2['department'])).' '.trim($row2['number']);
			if($encodeHTML) {
				$str = $str.'<div title = "Remove This Class" onClick="toggleClass('.$class.');" class="removeclass"></div>';
			}
			if(!$block)
			{
				$str = $str.'&#x2014;'.ucwords($row2['name']);
			}
			$str = $str.'<span class="class-info">';
			$str = $str.trim(strtoupper($row2['department'])).' '.trim($row2['number']).'<br />'.
					ucwords($row2['name']).'<br />'.
					$row2['instructor'].'<br />'.
					$row2['day'].'&#x2014;'.$row2['time'].'<br />'.
					$row2['location'].
					'<br /> Class information/description</span></a><br /></div>';
					
		echo $encodeHTML ? htmlspecialchars($str) : $str;
		
		return $row2['id'];
		}
	}
	
	// generates XML class blocks for display on schedule
	function genClassBlock($class) {
		if (isset($_GET['quarter'])) {$qu = $_GET['quarter']; }
		else {$qu = 0;}
		$url = "functions.php?quarter=$qu";
		
		$query2 = "SELECT * FROM hci_ca_courses WHERE id=\"$class\"";
		$result2 = mysql_query($query2) or die(mysql_error());
		while($row2 = mysql_fetch_assoc($result2)) {
			echo '<CLASS>';
			
			echo '<ID>'.$class.'</ID>';
			echo '<LINK>';
			$this->genClassLink($class, true, true);
			echo '</LINK>';
			
			//echo '<DAY>';
			$daybools = dayParse($row2['day']);
				echo '<DAY>'.$daybools[1].'</DAY>';
				echo '<DAY>'.$daybools[2].'</DAY>';
				echo '<DAY>'.$daybools[3].'</DAY>';
				echo '<DAY>'.$daybools[4].'</DAY>';
				echo '<DAY>'.$daybools[5].'</DAY>';
			//echo '</DAY>';
			
			echo '<TIME>';
				list($begin, $end) = explode("-", $row2['time']);
				echo '<ASSTRING>'.trim($row2['time']).'</ASSTRING>';
				echo '<BEGIN>'.$this->timeParse($begin).'</BEGIN>';
				echo '<LENGTH>'.$this->findTimeLength($begin, $end).'</LENGTH>';
			echo '</TIME>';
			echo '</CLASS>';
		}
			
		return $row2['id'];
	}
	
	// returns $taking as an XML file of class blocks
	function getSchedule() {		
		header('Content-type: text/xml');
		header('Pragma: public');
		header('Cache-control: private');
		header('Expires: -1');

		echo '<?xml version="1.0" encoding="UTF-8"?>
			<CLASSLIST>';
		foreach($this->schedule[$this->year][$this->quarter] as $id) {
			$this->genClassBlock($id);
		}
		echo '</CLASSLIST>'; 
	}
	
	// parses times into an id of one of the tr elements on our table.
	function timeParse($time) {
		$trimmed = trim($time, " AMPM");
		$trimmed = str_replace(array("20", "50"), array("30", "00"), $trimmed);
		return str_replace(":", "-", $trimmed);
	}
	
	// finds the length of the course as number of 30 minutes blocks
	function findTimeLength($begin, $end) {
		$beginParsed = explode(":", $begin);
		$beginMinutes = trim($beginParsed[1], " AMPM");
		$endParsed = explode(":", $end);
		$endMinutes = trim($endParsed[1], " AMPM");
		$endMinutes = str_replace(array("20", "50"), array("30", "00"), $endMinutes);
		if($beginMinutes == $endMinutes) { //won't actually work for anything not an hour or an hour and a half. (i.e. 3 hour classes)
			return 2;
		}
		else {
			return 3;
		}
	}
	
	//Favorites list
	function setFav() {
		unset($this->favlist);
        $query = "SELECT * FROM hci_ca_usercourses WHERE user_id=\"".$this->id."\" AND type=\"fav\"";
        $result = mysql_query($query) or die(mysql_error());
        while($row = mysql_fetch_assoc($result)) {
			if ($this->checkQuarter($row['class_id'])) {
                $this->favlist[] = $row['class_id'];
			}
        }
		if(!isset($this->favlist)) {
			$this->favlist = array();
		}
        return $this->favlist; //For use with the recommended courses and all courses lists
	}
	
	function viewFav() { 
		$this->setFav();
		//$this->setFav();
		for ($ii=0; $ii < count($this->favlist); $ii++) {
				$this->genClassLink($this->favlist[$ii]);
        }
        //return $favlist; //For use with the recommended courses and all courses lists
    }

	//Recommended Lists
	function setRec() {
		$query = "SELECT * FROM hci_ca_courses WHERE quarter=\"".$this->quarter."\"";
		$result = mysql_query($query) or die(mysql_error());
		while($row = mysql_fetch_assoc($result)) {
			if (ar_index(trim($row['department']).' '.trim($row['number']), $this->nottakenlist['class']) != -1) {
				$this->genClassLink($row['id']);
				$this->reclist[] = $row['id'];
			}
		}
		return $this->reclist;
	}
	function viewRec() { //This works assuming you call viewdegree and viewFavs before you call the recommended list. 
		$row = null;
		$this->setRec();
		 for ($ii = 0; $ii < count($this->reclist); $ii++) {
				$this->genClassLink($row['id']);
			}
	}
	
	function setCourses($sort="dept") {
		$query = "SELECT * FROM hci_ca_courses WHERE quarter=\"".$this->quarter."\"";
		$result = mysql_query($query) or die(mysql_error());
		//Sort by Dept
		if ($sort == "name") {
			while($row = mysql_fetch_assoc($result)) { //I think this messes with how $courselist can be used
				$classlist[substr($row['name'], 0, 1)][] = $row['id'];
				$catlist[] = substr($row['name'], 0, 1);
			$courseids[] = $row['id'];
			}
		}else{
			while($row = mysql_fetch_assoc($result)) {
				$classlist[$row['department']][] = $row['id'];
				$catlist[] = $row['department'];
			$courseids[] = $row['id'];
			}
		}
		if(isset($catlist)) {
		$catlist = array_unique($catlist);
		sort($catlist);
		$this->courselist = $classlist;
		$this->catlist = $catlist;
		$this->courseids = $courseids;
		
		return $classlist;
		}
		else {
			return array();
		}
	}
	function viewCourses($sort = "dept") {
		// put in a drop down list code here.
		
		
		$this->setCourses($sort);
		
		echo '<ul class="menu1" class="example_menu">'; //List of categories
		for ($ii = 0; $ii < count($this->catlist); $ii++) {
			echo '<li><a class="collapsed">'.strtoupper($this->catlist[$ii]).'</a><ul>'; //List of classes
			sort($this->courselist[$this->catlist[$ii]]);
			for ($jj = 0; $jj < count($this->courselist[$this->catlist[$ii]]); $jj++) {
				echo '<li>';
				$this->genClassLink($this->courselist[$this->catlist[$ii]][$jj]);
				echo '</li>';
			}
			echo '</ul></li>';
		}
		echo '</ul>';
	}	

	
	function genDegCourses($classlist, $catlist, $suppress = false, $petitionMenu = false) {
		if(!$suppress) {
			echo ' <ul class="menu1 inner-menu">'; //List of categories
		}
		$displist = null;
		for ($ii = 0; $ii < count($catlist); $ii++) {
			if(!$suppress) {
				echo '<li><a class="collapsed">'.$catlist[$ii].'</a><ul>'; //List of classes
			}
			sort($classlist[$catlist[$ii]]);
			for ($jj = 0; $jj < count($classlist[$catlist[$ii]]); $jj++) {
				$str = $classlist[$catlist[$ii]][$jj];
				if ($classlist[$catlist[$ii]][$jj]) { //Check to see there actually is a specific class for the requirement
					//Check if taken yet
					unset($taken); 
					$taken = null;
					$classID = getCourseID($classlist[$catlist[$ii]][$jj]);
					$query = 'SELECT * FROM hci_ca_usercourses WHERE user_id ="'.$this->id.'" AND name="'.$classlist[$catlist[$ii]][$jj].'"';
					$result = mysql_query($query) or die(mysql_error());
					
					while($row = mysql_fetch_assoc($result)) {
						if ($row['type'] == "taken") {
							$taken = 1;						
						} elseif ($row['type'] == "petitioned") {			

							$taken = 2;
							$petclass = $row['petition'];
						}
					}
					
					if($petitionMenu) {
						$begin = '<li petid ="'.$classID.'" class = "petition-'.$classID.'" onClick = "selectForPetition('.$classID.', 2);">';
					} else
					{
						$begin = '<li>';
					}
					
					if ($taken == 1) {$str = $begin.'<img src="check.png" /> '.$str;}
					elseif ($taken == 2) {$str = $begin.'<img src="checkcircle.png" /> '.$petclass;}
					else {
						$str = $begin.'<img src="ex.png" /> '.$str;
						$this->nottakenlist['class'][] = $classlist[$catlist[$ii]][$jj];
						}
					if(!$suppress) {
						echo $str.'</li>';
					}
				} elseif (!$petitionMenu) { 
					unset($classname);
					unset($taken);
					$classname = null;
					$taken = null;
					$query = 'SELECT * FROM hci_ca_usercourses WHERE user_id ="'.$this->id.'" AND '.$this->school.'="'.$catlist[$ii].'"';
					$result = mysql_query($query) or die(mysql_error());
					while($row = mysql_fetch_assoc($result)) {
						if ($row['type'] == "taken") {
							$taken = 1;
						} elseif ($row['type'] == "petitioned") {
							$taken = 2;
						}
						if ($taken && ar_index($row['name'], $displist) == -1 ) {
							$classname = $row['name'];
							$displist[] = $row['name'];
						}
					}
					if ($classname && $taken ==1) {
						$str = '<li><img src="check.png" /> '.$classname.'</li>';
					} elseif ($classname && $taken == 2) {
						$str = '<li><img src="checkcircle.png" />'.$classname.' </li>';
					} else {
						$str = '<li><img src="ex.png" /></li>';
						$this->nottakenlist['category'][] = $catlist[$ii];
					}
					
					if(!$suppress) {
						echo $str;
					}
				}
			}
			if(!$suppress) {
				echo '</ul></li>';
			}
		}
		return $this->nottakenlist;
	}
	
	
	function viewDegree($suppressOutput = false, $petitionMenu = false) {
		//School
		if(!$suppressOutput) {
			echo '<ul class="menu1" class="example_menu"> <li><a class="collapsed">School: '.$this->school.'</a><br />';
		}
		$query = "SELECT * FROM hci_ca_reqs WHERE major=\"".$this->school."\"";
		$result = mysql_query($query) or die(mysql_error());
		while($row = mysql_fetch_assoc($result)) {
			$classlist[$row['category']][] = $row['class'];
			$catlist[] = $row['category'];
		}
		$catlist = array_unique($catlist);
		sort($catlist);
				
		$this->nottakenlist = $this->genDegCourses($classlist, $catlist, $suppressOutput, $petitionMenu);
		
		if(!$suppressOutput) {
			echo '</ul>';
			echo '</li>';
		}
		
		unset($classlist);
		unset($catlist);
		$catlist = array();
		$classlist = array();
		//Major
		for ($ii = 0; $ii < count($this->majors); $ii++) {
			if(!$suppressOutput) {
				echo '<li><a class="collapsed">Major: '.$this->majors[$ii].'</a><br />';
			}
			$query = "SELECT * FROM hci_ca_reqs WHERE major=\"".$this->majors[$ii]."\"";
			$result = mysql_query($query) or die(mysql_error());
			while($row = mysql_fetch_assoc($result)) {
				$classlist[$row['category']][] = $row['class'];
				$catlist[] = $row['category'];
			}
			$catlist = array_unique($catlist);
			sort($catlist);
					
			$this->nottakenlist = array_merge_recursive ($this->nottakenlist, $this->genDegCourses($classlist, $catlist, $suppressOutput, $petitionMenu));
			
			if(!$suppressOutput) {
				echo '</ul>';
				echo '</li>';
			}
		}
		
		
		//Minor
		unset($classlist);
		unset($catlist);
		for ($ii = 0; $ii < count($this->minors); $ii++) {
			$catlist = array();
			$classlist = array();
			if(!$suppressOutput) {
				echo '<li><a class="collapsed">Minor: '.$this->minors[$ii].'</a><br />';
			}
			$query = "SELECT * FROM hci_ca_reqs WHERE minor=\"".$this->minors[$ii]."\"";
			$result = mysql_query($query) or die(mysql_error());
			while($row = mysql_fetch_assoc($result)) {
				$classlist[$row['category']][] = $row['class'];
				$catlist[] = $row['category'];
			}
			$catlist = array_unique($catlist);
			sort($catlist);
					
			$this->nottakenlist = array_merge_recursive ($this->nottakenlist, $this->genDegCourses($classlist, $catlist, $suppressOutput, $petitionMenu));
			if(!$suppressOutput) {
				echo '</ul>';
				echo '</li>';
			}
		}
		if(!$suppressOutput) {
			echo '</ul>';
		}
		
		return $this->nottakenlist;
	}
	
	//Change Quarter
	function changeQuarter($direction) {
		$qnames = array("fall", "winter", "spring", "summer");
		$x = ar_index($this->quarter, $qnames) + $direction;
		$x = ($x - 4 * floor($x/4));
		$this->quarter = $qnames[$x];
		
		return $this->quarter;
	}
	/*
	///Suggest Courses/Schedule
	function suggest($limit = 4) {
		//Randomize lists (so that everytime you hit suggest again, you get a new suggestion)
		if (is_array($this->favlist)) {$favrecs = array_merge_recursive($this->favlist,$this->reclist);}
		else {$favrecs = $this->reclist;}
		if (is_array($this->taking)) {$sclass = $this->taking;}
		$sclass = $this->suggestSchedule($favrecs, $sclass, $limit);
		$this->taking = $sclass;
		//I'm just using this to print out the suggested classes tentatively.
		//Take this out in the final one I guess. 
		/*
		if(!($sclass)) {
			
		}
		for ($ii = 0; $ii < count($sclass); $ii ++) {
			$this->genClassLink($sclass[$ii]['id']);
		}
		if (isset($_GET['quarter'])) {$qu = $_GET['quarter']; }
		else {$qu = 0;}
		$url = "functions.php?quarter=$qu";
		echo '<a href="'.$url.'&take=clear">Suggest me a new schedule.</a>';
		return $sclass;
	} */
	
	function genClassItem($id) {
		//Set the class
		$query = "SELECT * FROM hci_ca_courses WHERE id=\"".$id."\"";
		$result = mysql_query($query) or die(mysql_error());
		while($row = mysql_fetch_assoc($result)) {
			$displayName = strtoupper($row['department']).' '.$row['number'];
			$days = dayParse($row['day']);
			$x = strpos($row['time'], "-");
			$start = substr($row['time'], 0, $x); //Check for off by one errors
			$end = substr($row['time'], $x+1);
			
			$class = array( "id" => $row['id'],
							"start" => $start,
							"end" => $end,
							"days" => $days,
							"displayName" => $displayName
							);
		}
		return $class;
	}
	
	/**
	function suggestSchedule($favrecs, $sclass=null, $limit = 4, $fav = true) {
		//This method will essentially return the first set of four classes that work.
		//Somewhat okay since the list of favs and recommended's always randomized each time. 
		shuffle($favrecs);
		
		$ii = 0;
		if ($ii <= count($favrecs)) {
			//Set the class
			$class = $this->genClassItem($favrecs[$ii]);
			unset($favrecs[$ii]); //remove from list so the function won't keep looking at it since it's confirmed to not work. 
			
			//check each item in $sclass for overlap
			$overlap = false;
			for ($jj = 0; $jj < count($sclass) && (!$overlap); $jj++) {
				if ($this->overlap($sclass[$jj], $class)) {
					$overlap = true;
				}
			}
			
			//Process
			if (count($sclass) < $limit) {
				if (!($overlap)) { 
					$sclass[] = $class; 
				}
			}
		} //echo count($favrec); //Something went wrong here.
		if (count($favrec) < 1 && count($sclass) < $limit) {
			if ($fav) { //echo 'fave is true<br >';
				$sclass = $this->suggestSchedule($this->courseids, $sclass, $limit, false);
			} else { //echo 'fave is false <br />';
				$sclass = $this->suggestSchedule($favrecs, $sclass, $limit, $fav);
			}
		}
		
		return $sclass;
		
	} //End suggest Schedule */
	
	function suggest() {
		$limit = 5 - count($this->schedule[$this->year][$this->quarter]); // four classes max
		
		if($limit <= 0) {
			echo 'FAIL';
			return -1;
		}
		
		$query = "SELECT * FROM hci_ca_courses WHERE quarter=\"".$this->quarter."\"";
		$result = mysql_query($query) or die(mysql_error());
		$classlist = array();
		while($row = mysql_fetch_assoc($result)) {
			$classlist[] = $row['id'];
		}
		
		shuffle($classlist);
		
		$index = 0;
		while ($limit > 0 && $index < count($classlist)) {
			if($this->isTaking($classlist[$index]) == -1) {
				$this->toggleClass($classlist[$index]);
				$limit--;
			}
			$index++;
		}
		return 0;
	}
	
	function toggleFavorite($CourseID){
	
		$is_it_in_fav_table = mysql_query("SELECT * FROM hci_ca_usercourses WHERE class_id = $CourseID AND type = 'fav'");
		if(mysql_num_rows($is_it_in_fav_table) >= 1)
		{
		mysql_query("DELETE FROM hci_ca_usercourses WHERE class_id = $CourseID");
		}
		else {
		$le_course_name = mysql_fetch_assoc(mysql_query("SELECT name FROM hci_ca_courses WHERE id = $CourseID "));  
		$le_actual_course_name = $le_course_name['name'];
		mysql_query("Insert INTO hci_ca_usercourses (user_id, name, class_id, type)
				   VALUES(\"$this->id\", \"$le_actual_course_name\", $CourseID, \"fav\")");
		}
	}
	
	
	function toggleClass($id) { //echo $id;
		$class = $this->genClassItem($id); //print_r($class); echo '<br />';
		$jj = $this->isTaking($id, true); //echo $jj;
		if ($jj > -1) { //echo '<br />Deleting '.$jj;
			unset($_SESSION['taking'][$jj]);
		} else { //echo '<br />Adding';
			$_SESSION['taking'][] = $class;
			$this->taking = $class;
			//print_r($_SESSION['taking']);
		}
		
		if(!isset($this->schedule[$this->year])) {
			$this->schedule[$this->year] = array();
		} else if (!isset($this->schedule[$this->year][$this->quarter])) {
			$this->schedule[$this->year][$this->quarter] = array();
		}
		
		if(isset($this->schedule[$this->year][$this->quarter][$id])) {
			unset($this->schedule[$this->year][$this->quarter][$id]);
		}
		else {
			$this->schedule[$this->year][$this->quarter][$id]=$id;
		}
		
		$query = 'UPDATE hci_ca_users SET schedule = "'.htmlentities(serialize($this->schedule),ENT_QUOTES).'" WHERE id='.$this->id;
		$result = mysql_query($query) or die(mysql_error());
	}
	
	function processMajor($majors, $minors) {
		if (is_array($majors)) {
		for ($ii = 0; $ii < 2; $ii ++) {
		if (isset($majors[$ii])) {
		if ($majors[$ii] == "remove") {$majors[$ii] = NULL;}
		$query = 'UPDATE hci_ca_users SET major'.($ii+1).' = "'.$majors[$ii].'" WHERE id="'.$this->id.'"';
		$result = mysql_query($query) or die(mysql_error());
		}
		}
		} elseif (isset($majors)) {
		if ($majors == "remove") {$majors = NULL;}
		$query = 'UPDATE hci_ca_users SET major1 = "'.$majors.'" WHERE id="'.$this->id.'"';
		$result = mysql_query($query) or die(mysql_error());
		}

		if (is_array($minors)) {
		for ($ii = 0; $ii < 3; $ii ++) {
		if (isset($majors[$ii])) {
		if ($minors[$ii] == "remove") {$minors[$ii] = NULL;}
		$query = 'UPDATE hci_ca_users SET minor'.($ii+1).' = "'.$minors[$ii].'" WHERE id="'.$this->id.'"';
		$result = mysql_query($query) or die(mysql_error());
		}
		}
		} elseif (isset($minors)) {
		if ($minors == "remove") {$minors = NULL;}
		$query = 'UPDATE hci_ca_users SET minor = "'.$minors.'" WHERE id="'.$this->id.'"';
		$result = mysql_query($query) or die(mysql_error());
		}

	}
	
	function toggleMajor($name) {
		for ($ii = 0; $ii < 2; $ii ++) {
			if (isset($this->majors[$ii])) {
				if ($this->majors[$ii] == $name) { 
					$this->majors[$ii] = NULL; 
					$query = 'UPDATE hci_ca_users SET major'.($ii+1).' = "'.$this->majors[$ii].'" WHERE id="'.$this->id.'"';
					$result = mysql_query($query) or die(mysql_error());
					
					for ($ii = $ii; $ii < 1; $ii++) {
						$this->majors[$ii] = $this->majors[$ii+1];
						
						$query = 'UPDATE hci_ca_users SET major'.($ii+1).' = "'.$this->majors[$ii].'" WHERE id="'.$this->id.'"';
						$result = mysql_query($query) or die(mysql_error());
					}
					
					echo 'OK';
					return;
				}
			} else {
					$this->majors[$ii] = $name;
					$query = 'UPDATE hci_ca_users SET major'.($ii+1).' = "'.$this->majors[$ii].'" WHERE id="'.$this->id.'"';
					$result = mysql_query($query) or die(mysql_error());
					echo 'OK';
					return;
			}
		}
		echo 'FAIL';
	}
	
	function toggleMinor($name) {
			for ($ii = 0; $ii < 3; $ii++) {
			if (isset($this->minors[$ii])) {
				if ($this->minors[$ii] == $name) { 
					$this->minors[$ii] = NULL; 
					$query = 'UPDATE hci_ca_users SET minor'.($ii+1).' = "'.$this->minors[$ii].'" WHERE id="'.$this->id.'"';
					$result = mysql_query($query) or die(mysql_error());
					
					for ($ii = $ii; $ii < 2; $ii++) {
						$this->minors[$ii] = $this->minors[$ii+1];
						
						$query = 'UPDATE hci_ca_users SET minor'.($ii+1).' = "'.$this->minors[$ii].'" WHERE id="'.$this->id.'"';
						$result = mysql_query($query) or die(mysql_error());
					}
					
					echo 'OK';
					return;
				}
			} else {
					$this->minors[$ii] = $name;
					$query = 'UPDATE hci_ca_users SET minor'.($ii+1).' = "'.$this->minors[$ii].'" WHERE id="'.$this->id.'"';
					$result = mysql_query($query) or die(mysql_error());
					echo 'OK';
					return;
			}
		}
		echo 'FAIL';
	}
	
	function printMajorsMinors() {
		echo '<ul class="menu1"><li>';
			echo '<a class = "expanded">Majors</a><ul class = "major-menu">';
			if(count($this->majors) > 0) {
				foreach($this->majors as $major) {
					echo htmlspecialchars_decode('<li><div onClick = "toggleMajor(&#039;'.$major.'&#039;);" class="removeclass"></div> '.$major.'</li>', ENT_QUOTES);
				}
			}
		echo '</ul></li><li>';
			echo '<a class = "expanded">Minors</a><ul class = "minor-menu">';
			if(count($this->minors) > 0) {
				foreach($this->minors as $minor) {
					echo htmlspecialchars_decode('<li><div onClick = "toggleMinor(&#039;'.$minor.'&#039;);" class="removeclass"></div> '.$minor.'</li>', ENT_QUOTES);
				}
			}
		echo '</ul></li></ul>';
	}

	function petitionClass($classid, $for, $classname = NULL) {
		//$for should be a string
		$fors = getCourseName($for);
		if (!isset($classname)) {
		$classname = getCourseNameB($classid);
		}

		$query = 'UPDATE hci_ca_usercourses SET name = "'.$fors.'" WHERE user_id="'.$this->id.'" AND class_id="'.$classid.'" AND type="taken"';
		$result = mysql_query($query) or die(mysql_error());
		$query = 'UPDATE hci_ca_usercourses SET petition = "'.$classname.'" WHERE user_id="'.$this->id.'" AND class_id="'.$classid.'" AND type="taken"';
		$result = mysql_query($query) or die(mysql_error());
		$query = 'UPDATE hci_ca_usercourses SET type = "petitioned" WHERE user_id="'.$this->id.'" AND class_id="'.$classid.'" AND type="taken"';
		$result = mysql_query($query) or die(mysql_error());
	}
	
	function genTakenClassesList() {
		echo '<ul>';
		$takenClasses = $this->getAllTakenClasses();
		if(count($takenClasses) > 0) {
			foreach($takenClasses as $classID) {
				$c = $this->genClassItem($classID);
				echo '<li pet-id="'.$classID.'" class="petition-'.$classID.'" onclick="selectForPetition('.$classID.', 1);">';
				
				echo $c['displayName'];
				
				echo '</li>';
			}
		}
		echo '</ul>';
	}
	
	function getAllTakenClasses() {
		 $classes = NULL;
		 $query = "SELECT * FROM hci_ca_usercourses WHERE user_id=\"".$this->id."\" AND type=\"taken\" ";
		 $result = mysql_query($query) or die(mysql_error());
		 while($row = mysql_fetch_assoc($result)) {
		  $classes[] = $row['class_id'];
		 }
		 
	 return $classes;
	}
	
	
}


 

/*

//Testing Ground. This'll be taken out in the final thing.
if ($_GET['take']=="clear") {unset($_SESSION['taking']); unset($_GET['take']);}
$stud = new student(1, 'fall'); //Student ID, Quarter
if (isset($_GET['quarter'])) { $stud->changeQuarter($_GET['quarter']);}
if (isset($_GET['sort'])) {$sort = $_GET['sort'];}
	else { $sort = "dept";}
if (isset($_GET['fav'])) { $stud->toggleFavorite($_GET['fav']);}
if (isset($_GET['take'])) { $stud->toggleClass($_GET['take']);}
echo '<div style="background-color:#6a9421;"><h3><a href="functions.php?quarter='.($_GET[quarter]-1).'">Previous Quarter? <img src="prevquart.png" /></a> ';
echo '| <a href="functions.php?quarter=0">Current Quarter?</a> ';
echo '| <a href="functions.php?quarter='.($_GET[quarter]+1).'"> <img src="nextquart.png" /> Next Quarter?</a></h3>';
echo '<h2>'.$stud->quarter.'</h2>';

//echo '<br />Sessoin variable: ';
//print_r($_SESSION['taking']);


echo '<div style="float:left">';
$stud->viewDegree();
echo '</div><div style="float:left">';
$stud->viewFav();
$stud->viewRec();
$stud->viewCourses($sort);

$stud->suggest();
echo '</div>'; */
?>