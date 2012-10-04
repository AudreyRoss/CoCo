window.onload = function() {
    init();
}

window.onresize = function() {
    redraw();
}

function init() {
	// need days for schedule injection.
	dayNames = {
        MONDAY: { value: 0, name: "Monday" },
        TUESDAY: { value: 1, name: "Tuesday" },
        WEDNESDAY: { value: 2, name: "Wednesday" },
        THURSDAY: { value: 3, name: "Thursday" },
        FRIDAY: { value: 4, name: "Friday" }        
    };
    
    days = [dayNames.MONDAY, dayNames.TUESDAY, dayNames.WEDNESDAY, dayNames.THURSDAY, dayNames.FRIDAY];

	// Schedule tr id injections.
	$("#schedule td").each(function() {
		var cse = $(this).html().replace(":", "-");
		if(!$(this).parents("tr").hasClass("dont-add-to-me")) {
			$(this).parents("tr").attr("id", cse);
			var trDomObject = document.getElementById(cse);
			
			for(var i = 0; i < days.length; i++) {
				var x = trDomObject.insertCell(days[i].value + 1);
				x.setAttribute('class', days[i].name);
			}
		}
	});
	
	// available majors/minors injections
	$("#available-majors-minors .major-menu .inner-menu li").each(function() {
		var name = $(this).text();
		
		var addRemoveButton = document.createElement("div");
		addRemoveButton.setAttribute("class", "addclass major-minor-button " + name.replace(/\s/g,"").replace(/\\/g, "").replace(/g\\/, "") + "major");
		addRemoveButton.setAttribute("style", "margin-right: 5px;");
		addRemoveButton.setAttribute("onclick", "toggleMajor('" + name + "');");
		
		$(this).prepend(addRemoveButton);
	});
	
	$("#available-majors-minors .minor-menu .inner-menu li").each(function() {
		var name = $(this).text();
		
		var addRemoveButton = document.createElement("div");
		addRemoveButton.setAttribute("class", "addclass major-minor-button " + name.replace(/\s/g,"").replace(/\\/g, "").replace(/g\\/, "") + "minor");
		addRemoveButton.setAttribute("style", "margin-right: 5px;");
		addRemoveButton.setAttribute("onclick", "toggleMinor('" + name + "');");
		
		$(this).prepend(addRemoveButton);
	});

	stage = new Kinetic.Stage("main-window", 0, 0);
    
    viewWidth = Math.max(window.innerWidth, 900);
    viewHeight = 780;

	// CLASS
	
	applyClassTooltips();

    panels = {
        center: {
            name: "centerPanel",
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            open: true,
            setParams: function() {
                var leftPanelMargin = panels.left.width == 0 ? 30 : 50;
                var rightPanelMargin = panels.right.width == 0 ? 30 : 50;
                this.x = leftPanelMargin + panels.left.width;
                this.y = 20;
                this.width = viewWidth - (leftPanelMargin + rightPanelMargin) - panels.right.width - panels.left.width;
                this.height = viewHeight - 40;
            }           
        },
        
        left: {
            name: "leftPanel",
            x: 0,
            y: 0,
            width: 300,
            height: 780,
            open: true,
            setParams: function() {
                this.x = 20;
                this.y = 20;
                this.height = viewHeight - 40;
            }
        },
        
        right: {
            name: "rightPanel",
            x: 0,
            y: 0,
            width: 300,
            height: 780,
            open: true,
            setParams: function() {
                this.x = viewWidth - 20 - this.width;
                this.y = 20;
                this.height = viewHeight - 40;
            }
        }
    }
    
    panelsAsArray = new Array(panels.left, panels.center, panels.right);
    
    // poor solution 
    for(var i = 0; i < panelsAsArray.length; i++) {
        panelsAsArray[i].kineticBackground = new Kinetic.Shape({
            drawFunc: function() {
                var panelRef = this.getParent().panelReference;
                var ctx = this.getContext();
                panelRef.setParams();
                this.getParent().setPosition(panelRef.x, panelRef.y);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, panelRef.width, panelRef.height);
                
                // necessary for Kinetic's input management to work correctly.
                ctx.beginPath();
                ctx.closePath();
            }})
        panelsAsArray[i].kineticGroup = new Kinetic.Layer({
            name: panelsAsArray[i].name
        });
        panelsAsArray[i].kineticGroup.panelReference = panelsAsArray[i];
        panelsAsArray[i].kineticGroup.add(panelsAsArray[i].kineticBackground);
        panelsAsArray[i].animationHandle = -1; // I don't think JS setInterval ever returns negative values as a handler. If it does... oops.
    }    
    currentQuarter = seasonNames().FALL;
    currentYear = 2012;
    
    colorScheme = currentQuarter.color;
	$(".menu1 > li > a").parent().css("background", colorScheme[1]);
	$(".menu1 > li > ul > li > a").parent().css("background", colorScheme[0]);
	$("#available-courses, .left-panel-screen, body").css("background",colorScheme[2]);
	$("#degree-requirements-options li, #majors-minors-options li, #petition-options li, .selected").css("background",colorScheme[1]);
	$("#schedule tr:nth-child(even)").css("background",colorScheme[0]);
	
	leftPanelState = {
		DEGREE_REQUIREMENTS: { value: 0, name: "Degree Requirements" },
		CHANGE_MAJOR_MINOR: { value: 1, name: "Change Major/Minor" },
		PETITION_A_CLASS: { value: 2, name: "Petition a Class" }
	}
    
	leftPanelStateOpen = leftPanelState.DEGREE_REQUIREMENTS;
    
    // PANEL OPEN/CLOSE BUTTONS
    var leftPanelButton = new Kinetic.Shape({
        drawFunc: function() {
            var ctx = this.getContext();
            
            this.setPosition(panels.left.width != 0 ? panels.left.width + 35 : panels.left.width + 15, 340);
            
            ctx.save();
            
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "20px Arial";
            ctx.fillText(leftPanelStateOpen.name, 0, 0, 200);
            
            ctx.restore();
            
            if(this.hover) {
                ctx.fillStyle = "transparent";
                ctx.shadowBlur = 7;
                ctx.shadowColor = "white";
                
                ctx.beginPath();
                ctx.arc(0, -115, 20, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(0, 115, 20, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.fill();
            }
            
            var imgSrc = panels.left.width != 0 ? "collapse-left" : "collapse-right";
            
            ctx.drawImage(document.getElementById(imgSrc), -10, -130, 20, 20);
            ctx.drawImage(document.getElementById(imgSrc), -10, 110, 20, 20);
            
            var x1 = -15;
            var y1 = -320;
            var x2 = 15;
            var y2 = 320;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y1);
            ctx.closePath();
    },
    hover: false});
    
    leftPanelButton.on("click", function() {
        clearInterval(panels.left.width);
        if(panels.left.width == 0)
            panels.left.animationHandle = setInterval(openPanel, 1, panels.left);
        else
            panels.left.animationHandle = setInterval(closePanel, 1, panels.left);
    })
    
    leftPanelButton.on("mousemove", function() {
        this.hover = true;
        this.getLayer().draw();
    });
    
    leftPanelButton.on("mouseout", function() {
        this.hover = false;
        this.getLayer().draw();
    });
    
    var rightPanelButton = new Kinetic.Shape({
        drawFunc: function() {
            var ctx = this.getContext();
            
            this.setPosition(panels.right.width != 0 ? viewWidth - panels.right.width - 35 : viewWidth - 15, 340);
            
            ctx.save();
            
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "20px Arial";
            ctx.fillText("Available Courses", 0, 0, 200);
            
            ctx.restore();
            
            if(this.hover) {
                ctx.fillStyle = "transparent";
                ctx.shadowBlur = 7;
                ctx.shadowColor = "white";
                
                ctx.beginPath();
                ctx.arc(0, -115, 20, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(0, 115, 20, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.fill();
            }
            
            var imgSrc = panels.right.width != 0 ? "collapse-right" : "collapse-left";
            
            ctx.drawImage(document.getElementById(imgSrc), -10, -130, 20, 20);
            ctx.drawImage(document.getElementById(imgSrc), -10, 110, 20, 20);
            
            var x1 = -35;
            var y1 = -320;
            var x2 = 0;
            var y2 = 320;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y1);
            ctx.closePath();
    },
    hover: false});
    
    rightPanelButton.on("click", function() {
        clearInterval(panels.right.width);
        if(panels.right.width == 0)
            panels.right.animationHandle = setInterval(openPanel, 1, panels.right);
        else
            panels.right.animationHandle = setInterval(closePanel, 1, panels.right);
    });
    
    rightPanelButton.on("mousemove", function() {
        this.hover = true;
        this.getLayer().draw();
    });
    
    rightPanelButton.on("mouseout", function() {
        this.hover = false;
        this.getLayer().draw();
    });
    
    // SCHEDULE BACKGROUND
    panels.center.kineticGroup.add(new Kinetic.Shape({
        drawFunc: function() {
            var panelRef = this.getParent().panelReference;
			var x = panelRef.x;
			var y = panelRef.y;
            var width = panelRef.width;
            var height = panelRef.height;
            var ctx = this.getContext();
			
			// kinetic
			ctx.beginPath();
			ctx.closePath();
            
			//  old html overlayed on a canvas
			$("#schedule").css({
				left: x + 10,
				width: width - 20,
			});
			


            // draw the current quarter / year
            ctx.save();
            var grd = ctx.createRadialGradient(width / 2, 50, 20, width / 2, 50, width / 2);
            grd.addColorStop(0, colorScheme[0]);
            grd.addColorStop(1, colorScheme[2]);
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, width, 100);
            
			currentQuarter.draw(ctx, 0, 0, width);
			
            ctx.fillStyle = currentQuarter.color[2];            
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "30px Arial";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 5;
            ctx.shadowColor = currentQuarter.color[2];
            ctx.fillText(currentQuarter.name + " Quarter " + currentYear, width/2, 50, width - 80);
            ctx.restore();
            
			/* OLD CANVAS BASED SCHEDULE <-- IGNORE
            // draw day names
            var xStep = (width - 90) / days.length;
            ctx.fillStyle = "black";
            ctx.font = "18px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            for(var i = 0; i < days.length; i++) {
                ctx.fillText(days[i].name, 70 + i * xStep + xStep / 2, 120, xStep);
            }
            
            // draw times
            var yStep = (height - 130) / ((17 - 8) * 2);
            for(var i = 0; i < (17 - 8) * 2; i++) {
                ctx.fillText(convertNumberToTime(8 + i / 2), 50, 120 + i * yStep + yStep / 2); */
		         
        }}));
    
    // SCHEDULE PREVIOUS/NEXT BUTTONS
    var previousQuarterButton = new Kinetic.Shape({
        drawFunc: function() {
            var x = panels.center.x;
            var y = panels.center.y;
            var width = panels.center.width;
            var ctx = this.getContext();
            
            this.setPosition(Math.max(x, x + width / 2 - 200), y + 30);
            
            ctx.fillStyle = "transparent";
            ctx.beginPath();
            ctx.arc(25, 25, 30, 0, Math.PI * 2, false);
            ctx.closePath();
            if(this.hover) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = colorScheme[2];
                ctx.shadowOffsetY = 7;
                ctx.fill();
            }
            
            ctx.drawImage(document.getElementById("quarter-left"), 0, 0, 40, 40);
    },
    hover: false});
    
    previousQuarterButton.on("click", function() {
        decrementSeason();
        this.move(0, -10);
        this.getLayer().draw();
		
		tooltip.setFill(colorScheme[2]);
		stage.getChild("tooltipLayer").draw();
    });
    
    previousQuarterButton.on("mousemove", function() {
        this.hover = true;
        this.move(0, -10);
        this.getLayer().draw();
		
		var mousePos = stage.getMousePosition();
		
		var canvas = stage.getChild("tooltipLayer").getCanvas();
		canvas.style.zIndex = 100;
		tooltip.setPosition(mousePos.x + 5, mousePos.y + 5);
		tooltip.setText("Previous Quarter");
		tooltip.setFill(colorScheme[2]);
		tooltip.show();
		stage.getChild("tooltipLayer").draw();
    });
    
    previousQuarterButton.on("mouseout", function() {
        this.hover = false;
        this.move(0,0);
        this.getLayer().draw();
		
		var canvas = stage.getChild("tooltipLayer").getCanvas();
		canvas.style.zIndex = 0;
		tooltip.hide();
		stage.getChild("tooltipLayer").draw();
    });
    
    var nextQuarterButton = new Kinetic.Shape({
        drawFunc: function() {
            var x = panels.center.x;
            var y = panels.center.y;
            var width = panels.center.width;
            var ctx = this.getContext();
            
            this.setPosition(Math.min(x + width - 40, x + width / 2 + 160), y + 30);
            
            ctx.fillStyle = "transparent";
            ctx.beginPath();
            ctx.arc(25, 25, 30, 0, Math.PI * 2, false);
            ctx.closePath();
            if(this.hover) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = colorScheme[2];
                ctx.shadowOffsetY = 7;
                ctx.fill();
            }
            
            ctx.drawImage(document.getElementById("quarter-right"), 0, 0, 40, 40);
    },
    hover: false});
    
    nextQuarterButton.on("click", function() {
        incrementSeason();
        this.move(0, -10);
        this.getLayer().draw();
		
		tooltip.setFill(colorScheme[2]);
		stage.getChild("tooltipLayer").draw();
    });
    
    nextQuarterButton.on("mouseover", function() {
        this.hover = true;
        this.move(0, -10);
        this.getLayer().draw();
		
		mousePos = stage.getMousePosition();
		
		var canvas = stage.getChild("tooltipLayer").getCanvas();
		canvas.style.zIndex = 100;
		tooltip.setPosition(mousePos.x + 5, mousePos.y + 5);
		tooltip.setText("Next Quarter");
		tooltip.setFill(colorScheme[2]);
		tooltip.show();
		stage.getChild("tooltipLayer").draw();
    });
    
    nextQuarterButton.on("mouseout", function() {
        this.hover = false;
        this.move(0, 0);
        this.getLayer().draw();
		
		var canvas = stage.getChild("tooltipLayer").getCanvas();
		canvas.style.zIndex = 0;
		tooltip.hide();
		stage.getChild("tooltipLayer").draw();
    });
    
    var buttonsLayer = new Kinetic.Layer({
        name: "buttonsLayer"
        });
    
    buttonsLayer.add(previousQuarterButton);
    buttonsLayer.add(nextQuarterButton);
    buttonsLayer.add(leftPanelButton);
    buttonsLayer.add(rightPanelButton);
    
    var backgroundLayer = new Kinetic.Layer({
        name: "backgroundLayer"
    });
    
    // DEGREE REQUIREMENTS SCREEN
    
    var degreeRequirementsGroup = new Kinetic.Group({
        name: "degreeRequirements"
    });
    
    degreeRequirementsGroup.add(new Kinetic.Shape( {
        drawFunc: function() {
            var ctx = this.getContext();
            
			// position the degree requirements list correctly
	
			var dReq = document.getElementById("degree-requirements");
			var dReq2 = document.getElementById("change-major-minor");
			var dReq3 = document.getElementById("petition-a-class");
			
			var offset = 2;
			if(panels.left.width == 0) offset = 0;
			dReq.style.width = panels.left.width + offset + "px";
			dReq2.style.width = panels.left.width + offset + "px";
			dReq3.style.width = panels.left.width + offset + "px";			
			
            ctx.beginPath();
            ctx.closePath();
        }
    }));
    
    // CHANGE MAJOR MINOR SCREEN
    
    var changeMajorMinorGroup =  new Kinetic.Group( {
        name: "changeMajorMinor"
    });
    
    changeMajorMinorGroup.hide();
    
    panels.left.kineticGroup.add(degreeRequirementsGroup);
    panels.left.kineticGroup.add(changeMajorMinorGroup);
	
	// AVAILABLE COURSES
	
	var availableCoursesGroup = new Kinetic.Group({
		name: "availableCourses"
	});
	
	availableCoursesGroup.add(new Kinetic.Shape( {
        drawFunc: function() {
            var ctx = this.getContext();

			var x = panels.right.x;
			var y = panels.right.y;
			var width = panels.right.width;
			var height = panels.right.height;

			// position the degree requirements list correctly
			var aCour = document.getElementById("available-courses");
			
			aCour.style.left = isScrollBarVisible() ? x - 15 + "px" : x + "px";
			aCour.style.width = width + "px";			
			/*
			var grd = ctx.createLinearGradient(x, y, x + width, y + height);
			grd.addColorStop(0, colorScheme[0]);
			grd.addColorStop(1, colorScheme[2]);
			ctx.fillStyle = grd;
			ctx.fillRect(x, y, width, height);
			*/
            ctx.beginPath();
            ctx.closePath();
        }}));
	
	panels.right.kineticGroup.add(availableCoursesGroup);
    
    var background = new Kinetic.Shape({
        drawFunc: function() {
        var ctx = this.getContext();
        var grd = ctx.createRadialGradient(viewWidth / 2, viewHeight / 2, 50, viewWidth / 2, viewHeight / 2, viewWidth / 2);
        grd.addColorStop(0, colorScheme[0]);
        grd.addColorStop(0.5, colorScheme[1]);
        grd.addColorStop(1, colorScheme[2]);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, viewWidth, viewHeight);
    }});
    backgroundLayer.add(background);
    
    stage.add(backgroundLayer);
    
    for(var i = 0; i < panelsAsArray.length; i++) {
        stage.add(panelsAsArray[i].kineticGroup);
    }
    
    buttonsLayer.on("mouseover", function(){
        document.body.style.cursor = "pointer";
    });
    buttonsLayer.on("mouseout", function(){
        document.body.style.cursor = "default";
    });
    
    stage.add(buttonsLayer);
    
	// TOOLTIP STUFFS
	
    stage.add(new Kinetic.Layer({
        name: "tooltipLayer"
    }));
    
	tooltip = new Kinetic.Text({
		text: "",
		fontFamily: "Arial",
		fontSize: 12,
		padding: 10,
		textFill: "white",
		fill: "black",
		alpha: 1,
		visible: false
	});
	
	stage.getChild("tooltipLayer").add(tooltip);
	
	refreshSchedule();
	refreshCurrentMajorMinor();
	refreshPetitionClassList();
	refreshPetitionFor();
    redraw();
}

function redraw() {
    viewWidth = Math.max(window.innerWidth, 900);
    viewHeight = 780;
    
    stage.setSize(viewWidth, viewHeight);
    
    // draw everything
    stage.draw();
}

function incrementSeason() {
    switch(currentQuarter.value) {
        case seasonNames().SPRING.value:
            currentQuarter = seasonNames().SUMMER;
        break;
        case seasonNames().WINTER.value:
            currentQuarter = seasonNames().SPRING;
        break;
        case seasonNames().FALL.value:
            currentQuarter = seasonNames().WINTER;
            currentYear++;
        break;
        case seasonNames().SUMMER.value:
            currentQuarter = seasonNames().FALL;
        break;
    }
    
    onChangeSeason();
}

function decrementSeason() {
    switch(currentQuarter.value) {
        case seasonNames().SPRING.value:
            currentQuarter = seasonNames().WINTER;
        break;
        case seasonNames().WINTER.value:
            currentQuarter = seasonNames().FALL;
            currentYear--;
        break;
        case seasonNames().FALL.value:
            currentQuarter = seasonNames().SUMMER;
        break;
        case seasonNames().SUMMER.value:
            currentQuarter = seasonNames().SPRING;
        break;
    }
    
	onChangeSeason();
}

function onChangeSeason() {	
	colorScheme = currentQuarter.color;
	$(".menu1 > li > a").parent().css("background", colorScheme[1]);
	$(".menu1 > li > ul > li > a").parent().css("background", colorScheme[0]);
	$("#available-courses, .left-panel-screen, body").css("background",colorScheme[2]);
	$("#degree-requirements-options li, #majors-minors-options li, #petition-options li, .selected").css("background",colorScheme[1]);
	$("#schedule tr:nth-child(even)").css("background",colorScheme[0]);
    panels.center.kineticGroup.draw();
    stage.getChild("backgroundLayer").draw();
    stage.getChild("buttonsLayer").draw();
	
	refreshCourselist();
	refreshSchedule();
}

// helper function, only converts .5 -> :30 and .0 -> :00 and from british -> american time.
function convertNumberToTime(number) {
    if(number >= 13) number -= 12;
    
    if((parseFloat(number) == parseInt(number)) && !isNaN(number))
        return number + ":00";
    else
        return Math.floor(number) + ":30";
}

function seasonNames() {
    return {
        WINTER: { value: 0, name: "Winter", color: ["#98b5b9", "#6c9da3", "#5f888e"], draw: function(ctx, x, y, width) {
			ctx.drawImage(document.getElementById("banner-winter-right"), width - 639, y, 639, 100);
		}},
        SPRING: { value: 1, name: "Spring", color: ["#9eb96e", "#7aa72c", "#6a9421"] , draw: function(ctx, x, y, width) {
			ctx.drawImage(document.getElementById("banner-spring-left"), x, y, 525, 100);
			ctx.drawImage(document.getElementById("banner-spring-right"), width - 115, y, 115, 100);
		}},
        SUMMER: { value: 2, name: "Summer", color: ["#cbbf77", "#c1ae37", "#b09f2f"], draw: function(ctx, x, y, width) {
			ctx.drawImage(document.getElementById("banner-summer-left"), x, y, 122, 100);
			ctx.drawImage(document.getElementById("banner-summer-center"), width / 2 - 639 / 2, y, 639, 100);
		}},
        FALL: { value: 3, name: "Fall", color: ["#caa57e", "#bf8242", "#ae763a"], draw: function(ctx,x,y,width) {
			ctx.drawImage(document.getElementById("banner-fall-left"), x, y, 182, 100);
		}}
    };
}

function closePanel(panel) {
    panel.width -= 10;
    if(panel.width <= 0)
    {
        panel.width = 0;
        clearInterval(panel.animationHandle);
        stage.getChild("centerPanel").draw();
        stage.getChild(panel.name).draw();
        stage.getChild("buttonsLayer").draw();
    }
        
    stage.getChild("centerPanel").draw();
    stage.getChild(panel.name).draw();
    stage.getChild("buttonsLayer").draw();
}

function openPanel(panel) {
    panel.width += 10;
    if(panel.width >= 300)
    {
        panel.width = 300;
        clearInterval(panel.animationHandle);
        stage.getChild("centerPanel").draw();
        stage.getChild(panel.name).draw();
        stage.getChild("buttonsLayer").draw();
    }
        
    stage.getChild("centerPanel").draw();
    stage.getChild(panel.name).draw();
    stage.getChild("buttonsLayer").draw();
}

function openAvailableCoursesPanel() {
	if(panels.right.width == 0)
		panels.right.animationHandle = setInterval(openPanel, 1, panels.right);
	else {
		$("#available-courses").fadeOut(200, function() { 
			$(this).fadeIn(200);
		});
	}
}

function openChangeMajorMinorPanel() {
	if(panels.left.width == 0)
		panels.left.animationHandle = setInterval(openPanel, 1, panels.left);

	if(leftPanelStateOpen != leftPanelState.CHANGE_MAJOR_MINOR) {
		$(".left-panel-screen").fadeOut();
		$("#change-major-minor").fadeIn();
		leftPanelStateOpen = leftPanelState.CHANGE_MAJOR_MINOR;
		
		stage.getChild("leftPanel").draw();
		stage.getChild("buttonsLayer").draw();
	} else {
		$("#change-major-minor").fadeOut(200, function() { 
			$(this).fadeIn(200);
		});
	}
}

function openDegreeRequirementsPanel() {
	if(panels.left.width == 0)
		panels.left.animationHandle = setInterval(openPanel, 1, panels.left);

	if(leftPanelStateOpen != leftPanelState.DEGREE_REQUIREMENTS) {
		$(".left-panel-screen").fadeOut();
		$("#degree-requirements").fadeIn();
		leftPanelStateOpen = leftPanelState.DEGREE_REQUIREMENTS;
		
		stage.getChild("leftPanel").draw();
		stage.getChild("buttonsLayer").draw();
	} else {
		$("#degree-requirements").fadeOut(200, function() { 
			$(this).fadeIn(200);
		});
	}
}

function openPetitionAClassPanel() {
	if(panels.left.width == 0)
		panels.left.animationHandle = setInterval(openPanel, 1, panels.left);

	if(leftPanelStateOpen != leftPanelState.PETITION_A_CLASS) {
		$(".left-panel-screen").fadeOut();
		$("#petition-a-class").fadeIn();
		leftPanelStateOpen = leftPanelState.PETITION_A_CLASS;
		
		stage.getChild("leftPanel").draw();
		stage.getChild("buttonsLayer").draw();
	} else {
		$("#petition-a-class").fadeOut(200, function() { 
			$(this).fadeIn(200);
		});
	}
}

function refreshDegreeRequirements() {
	var xmlhttp = new XMLHttpRequest();
	var dReq = document.getElementById("degree-requirements-list");
	var loadingImage = document.getElementById("loading");
	
	dReq.innerHTML = "";
	$("#degree-requirements-list").append(loadingImage);
	loadingImage.style.display = "inline-block";
	
	xmlhttp.onreadystatechange=function() {
		dReq.innerHTML = xmlhttp.responseText;
		
		$("#preload").append(loadingImage);
		loadingImage.style.display = "none";
		
		// Slide
		$("#degree-requirements-list .menu1 > li > a.expanded + ul").slideToggle("medium");
		$("#degree-requirements-list .menu1 > li > a").click(function() {
			$(this).toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
		});
		$("#degree-requirements-list .menu1 > li > a").toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
		
		// Pointer cursor on hover.
		$("#degree-requirements-list .menu1 > li > a").mouseover(function() {
			document.body.style.cursor = "pointer";
		});
		
		$("#degree-requirements-list .menu1 > li > a").mouseout(function() {
			document.body.style.cursor = "default";
		});
		
		$("#degree-requirements-list .menu1 > li > a").parent().css("background", colorScheme[1]);
		$("#degree-requirements-list .menu1 > li > ul > li > a").parent().css("background", colorScheme[0]);
	}
	
	xmlhttp.open("GET","getDegreeRequirements.php?quarter=" + (currentQuarter.value - 3), true);
	xmlhttp.send();
}

function refreshCourselist() {
	var xmlhttp = new XMLHttpRequest();
	var dReq = document.getElementById("available-courses");
	var loadingImage = document.getElementById("loading");
	
	dReq.innerHTML = "";
	$("#available-courses").append(loadingImage);
	loadingImage.style.display = "inline-block";
	
	xmlhttp.onreadystatechange=function() {
		dReq.innerHTML = xmlhttp.responseText;
		
		$("#preload").append(loadingImage);
		loadingImage.style.display = "none";
		
		// Slide
		$("#available-courses .menu1 > li > a.expanded + ul").slideToggle("medium");
		$("#available-courses .menu1 > li > a").click(function() {
			$(this).toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
		});
		$("#available-courses .menu1 > li > a").toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
		
		// Pointer cursor on hover.
		$("#available-courses .menu1 > li > a").mouseover(function() {
			document.body.style.cursor = "pointer";
		});
		
		$("#available-courses .menu1 > li > a").mouseout(function() {
			document.body.style.cursor = "default";
		});
		
		$("#available-courses .menu1 > li > a").parent().css("background", colorScheme[1]);
		$("#available-courses .menu1 > li > ul > li > a").parent().css("background", colorScheme[0]);
		$("#available-courses").css("background",colorScheme[2]);
		
		applyClassTooltips();
	}
	
	xmlhttp.open("GET","getAvailableCourses.php?quarter=" + (currentQuarter.value - 3) + "&year=" + currentYear, true);
	xmlhttp.send();
}

function refreshPetitionClassList() {
	var xmlhttp = new XMLHttpRequest();
	var pet = document.getElementById("petition");
	var loadingImage = document.getElementById("loading");
	
	pet.innerHTML = "";
	$("#petition").append(loadingImage);
	loadingImage.style.display = "inline-block";
	
	xmlhttp.onreadystatechange=function() {
		pet.innerHTML = xmlhttp.responseText;
		
		$("#preload").append(loadingImage);
		loadingImage.style.display = "none";
	}
	
	xmlhttp.open("GET","getTakenClasses.php?quarter=" + (currentQuarter.value - 3) + "&year=" + currentYear, true);
	xmlhttp.send();
}

function favoriteClass(classID) {
	var xmlhttp = new XMLHttpRequest();
	var fav = document.getElementById("favorites");
	var loadingImage = document.getElementById("loading");
	
	fav.innerHTML = "";
	$("#favorites").append(loadingImage);
	loadingImage.style.display = "inline-block";
	
	xmlhttp.onreadystatechange=function() {
		$(".class-id-" + classID + " .faveoff, .class-id-" + classID + " .faveon").toggleClass("faveoff faveon");
		
		fav.innerHTML = xmlhttp.responseText;
		
		$("#preload").append(loadingImage);
		loadingImage.style.display = "none";
		
		applyClassTooltips();
		
		$("#favorites").fadeOut(200, function() { 
			$(this).fadeIn(200);
		});
	}
	
	xmlhttp.open("GET","getFavorites.php?quarter=" + (currentQuarter.value - 3) + "&fav=" + classID, true);
	xmlhttp.send();
}

function refreshCurrentMajorMinor() {
	var xmlhttp = new XMLHttpRequest();
	var pet = document.getElementById("current-major-minor");
	var loadingImage = document.getElementById("loading");
	
	$("#current-major-minor").fadeOut(200, function() {
		$(this).fadeIn(200);
	});
	
	pet.innerHTML = "";
	$("#current-major-minor").append(loadingImage);
	loadingImage.style.display = "inline-block";
	
	xmlhttp.onreadystatechange=function() {
		pet.innerHTML = xmlhttp.responseText;
		
		$("#preload").append(loadingImage);
		loadingImage.style.display = "none";
		
		// Slide
		$("#current-major-minor .menu1 > li > a").click(function() {
			$(this).toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
		});
		//$("#current-major-minor .menu1 > li > a").toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
		
		// Pointer cursor on hover.
		$("#current-major-minor .menu1 > li > a").mouseover(function() {
			document.body.style.cursor = "pointer";
		});
		
		$("#current-major-minor .menu1 > li > a").mouseout(function() {
			document.body.style.cursor = "default";
		});
		
		$("#current-major-minor .menu1 > li > a").parent().css("background", colorScheme[1]);
		
		$("#available-majors-minors .major-minor-button").removeClass("removeclass").addClass("addclass");
		
		$("#current-major-minor .major-menu li").each(function() {
			name = $(this).text();
			$(".major-menu ." + name.replace(/\s/g,"").replace(/\\/g, "").replace(/g\\/, "") + "major").addClass("removeclass").removeClass("addclass");
		});
		
		$("#current-major-minor .minor-menu li").each(function() {
			name = $(this).text();
			$(".minor-menu ." + name.replace(/\s/g,"").replace(/\\/g, "").replace(/g\\/, "") + "minor").addClass("removeclass").removeClass("addclass");
		});
	}
	
	xmlhttp.open("GET","getMajorMinor.php?quarter=" + (currentQuarter.value - 3) + "&year=" + currentYear, true);
	xmlhttp.send();
}

function toggleClass(classID) {
	var xmlhttp = new XMLHttpRequest();
	var sched = document.getElementById("schedule");
	
	$("#schedule .scheduled-class-container").remove();
	$("#schedule").fadeOut(200, function() {
		$(this).fadeIn(200);
	});

	$('#tooltip').css({ 'opacity' : 0, 'z-index' : -1 });
	$("#tooltip").children(".class-info").remove();
	
	xmlhttp.onreadystatechange=function() {
	if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		$(".class-id-" + classID + " .addclass, .class-id-" + classID + " .removeclass").toggleClass("addclass removeclass");
		
		xmlobj = xmlhttp.responseXML.documentElement.getElementsByTagName("CLASS");
		for(var classxml in xmlobj) {
			addClassToSchedule(xmlobj[classxml]);
		}
		
		applyClassTooltips();
		$(".scheduled-class").css('border-color', colorScheme[2]);
	}
	}
	
	xmlhttp.open("GET","toggleClass.php?quarter=" + (currentQuarter.value - 3) + "&id=" + classID + "&year=" + currentYear, true);
	xmlhttp.send();
}

function refreshSchedule() {
	var xmlhttp = new XMLHttpRequest();
	var sched = document.getElementById("schedule");
	
	$("#schedule .scheduled-class-container").remove();
	$("#schedule").fadeOut(200, function() {
		$(this).fadeIn(200);
	});

	xmlhttp.onreadystatechange=function() {
	if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {		
		xmlobj = xmlhttp.responseXML.documentElement.getElementsByTagName("CLASS");
		for(var classxml in xmlobj) {
			addClassToSchedule(xmlobj[classxml]);
		}
		
		applyClassTooltips();
		$(".scheduled-class").css('border-color', colorScheme[2]);
	}
	}
	
	xmlhttp.open("GET","getSchedule.php?quarter=" + (currentQuarter.value - 3) + "&year=" + currentYear, true);
	xmlhttp.send();
}

function refreshPetitionFor() {
	var xmlhttp = new XMLHttpRequest();
	var pet = document.getElementById("petition-for");
	var loadingImage = document.getElementById("loading");
	
	pet.innerHTML = "";
	$("#petition-for").append(loadingImage);
	loadingImage.style.display = "inline-block";
	
	xmlhttp.onreadystatechange=function() {
		pet.innerHTML = xmlhttp.responseText;
		
		$("#preload").append(loadingImage);
		loadingImage.style.display = "none";
		
		// Slide
		$("#petition-for .menu1 > li > a.expanded + ul").slideToggle("medium");
		$("#petition-for .menu1 > li > a").click(function() {
			$(this).toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
		});
		$("#petition-for .menu1 > li > a").toggleClass("expanded").toggleClass("collapsed").parent().find('> ul').slideToggle("medium");
		
		// Pointer cursor on hover.
		$("#petition-for .menu1 > li").mouseover(function() {
			document.body.style.cursor = "pointer";
		});
		
		$("#petition-for .menu1 > li").mouseout(function() {
			document.body.style.cursor = "default";
		});
		
		$("#petition-for .menu1 > li > a").parent().css("background", colorScheme[1]);
		$("#petition-for .menu1 > li > ul > li > a").parent().css("background", colorScheme[0]);
	}
	
	xmlhttp.open("GET","getPetitionableRequirements.php?quarter=" + (currentQuarter.value - 3), true);
	xmlhttp.send();
}

function suggestClasses() {
	var xmlhttp = new XMLHttpRequest();
	var sched = document.getElementById("schedule");
	
	$("#schedule .scheduled-class-container").remove();
	$("#schedule").fadeOut(200, function() {
		$(this).fadeIn(200);
	});

	xmlhttp.onreadystatechange=function() {
	if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		if(xmlhttp.responseText == "FAIL") {
			alert("We can't suggest a schedule when you've already picked 4 classes. Please remove some classes by clicking the minus signs in the upper left corner and try again.");
			refreshSchedule();
		} else {
		
		xmlobj = xmlhttp.responseXML.documentElement.getElementsByTagName("CLASS");
		for(var classxml in xmlobj) {
			addClassToSchedule(xmlobj[classxml]);
		}
		
		applyClassTooltips();
		$(".scheduled-class").css('border-color', colorScheme[2]);
		}
	}
	}
	
	xmlhttp.open("GET","suggestClasses.php?quarter=" + (currentQuarter.value - 3) + "&year=" + currentYear, true);
	xmlhttp.send();
}

function isScrollBarVisible() {
	return $(document).height() > $(window).height();
}

function applyClassTooltips() {
	$(".scheduled-class, .class").hover(function(e) {
		var x;
		var y;
		
		if(viewWidth - e.pageX > 300) {
			x = e.pageX + 5;
		}
		else if (viewWidth - e.pageX > 100) {
			x = e.pageX - 300;
		}
		else {
			x = e.pageX - 400;
		}
		
		if(viewHeight - e.pageY > 300) {
			y = e.pageY + 5;
		}
		else {
			y = e.pageY - 210;
		}
		
		$("#tooltip, #saved-prompt, .scheduled-class").css('border-color', colorScheme[2]);
		$('#tooltip').css({ 'left' : x, 'top' : y, 'opacity' : 1, 'z-index' : 1000 });
		$(this).find(".class-info").css('display', 'block');
		$('#tooltip').append($(this).find(".class-info"));
	},
	function(e) {
		$('#tooltip').css({ 'opacity' : 0, 'z-index' : -1 });
		$(this).append($("#tooltip").children(".class-info"));
		$(this).children(".class-info").css('display', 'none');
	});
	
	$("#schedule .removeclass").unbind("mouseleave").unbind("mouseenter").mouseenter(function(e) {
		$('#tooltip').css({ 'opacity' : 0, 'z-index' : -1 });
		$(this).parent(".scheduled-class").append($("#tooltip").children(".class-info"));
		$(this).parent(".scheduled-class").children(".class-info").css('display', 'none');
	});
}
// XML class
function addClassToSchedule(classxml) {
	var link = classxml.getElementsByTagName("LINK")[0].textContent;
	var id = classxml.getElementsByTagName("ID")[0].textContent;
	var daysnodes = classxml.getElementsByTagName("DAY");
	var time = classxml.getElementsByTagName("TIME")[0];
	
	var begin = time.getElementsByTagName("BEGIN")[0].textContent;
	var length = time.getElementsByTagName("LENGTH")[0].textContent;
	var timeastext = time.getElementsByTagName("ASSTRING")[0].textContent;
	
	for(var day in daysnodes) {
		if(daysnodes[day].textContent == "1") {
			var divcontainer = document.createElement('div');
			divcontainer.setAttribute("class","scheduled-class-container scheduled-class-id-" + id);
			var classdiv = document.createElement('div');
			classdiv.innerHTML = unescape(link) + '<br><span style="font-size:0.7em">' + timeastext + '</span>';
			divcontainer.appendChild(classdiv);
			classdiv.setAttribute("class", "scheduled-class scheduled-class-id-" + id);
			$("#schedule #" + begin + " ." + days[day].name).append(divcontainer);
		}
	}
	
	$(".scheduled-class-container .scheduled-class-id-" + id).css("height", length * $("td").height() + "px");
}

// petitioning
function selectForPetition(id, scope) {
	if(scope == 1) {
		scope = "#petition ul";
	}
	if(scope == 2) {
		scope = "#petition-for ul";
	}
	$(scope + " .selected").removeClass("selected").css("background", "white");
	$(scope + " .petition-" + id).addClass("selected").css("background", colorScheme[1]);
	
	if(scope == 2) {
		$("#petition-for ul .selected").parents(".menu1").find("a").css("background", "white");
	}
}

// petition
function petition() {
	if($("#petition .selected").length > 0 && $("#petition-for .selected").length > 0) {
		jQuery.post("petition.php?classid=" + $("#petition .selected").attr("pet-id") + "&for=" + $("#petition-for .selected").attr("petid"));
		
		showSavedPrompt(panels.left);
		
		refreshPetitionFor();
		refreshPetitionClassList();
		refreshDegreeRequirements();
		openDegreeRequirementsPanel();
	} else {
		alert("You must select both a course to petition and a degree requirement to substite it for.");
	}
}

function toggleMajor(name) {
	var xmlhttp = new XMLHttpRequest();
	var receivedOnce = false;
	
	xmlhttp.onreadystatechange=function() {	
		text = xmlhttp.responseText;
		if(text == "FAIL" && receivedOnce == false) {
			receivedOnce = true;
			alert("You may not add more than 2 majors.");
		} else {
			refreshCurrentMajorMinor();
			refreshDegreeRequirements();
		}
	}
	
	xmlhttp.open("GET","toggleMajor.php?name=" + name, true);
	xmlhttp.send();
}

function toggleMinor(name) {
	var xmlhttp = new XMLHttpRequest();
	var received = false;
	
	xmlhttp.onreadystatechange=function() {	
		text = xmlhttp.responseText;
		if(text == "FAIL" && received==false) {
			received = true;
			alert("You may not add more than 3 minors.");
		} else {
			refreshCurrentMajorMinor();
			refreshDegreeRequirements();
		}
	}
	
	xmlhttp.open("GET","toggleMinor.php?name=" + name, true);
	xmlhttp.send();
}

function showSavedPrompt(panel) {
	$("#saved-prompt").css({ "opacity" : 1, "z-index" : 1000, "top" : panel.y + 95 + panel.height / 2, "left" : panel.x + panel.width / 2 }).fadeIn(300).delay(800).fadeOut(300, function() { $(this).css({"opacity" : 0, "z-index": 0}); });
}	

function saveAndLogOff() {
	$("#saved-prompt").css({ "opacity" : 1, "z-index" : 1000, "top" : panels.center.y + 95 + panels.center.height / 2, "left" : panels.center.x + panels.center.width / 2 }).fadeIn(300).delay(800).fadeOut(300, function() { $(this).css({"opacity" : 0, "z-index": 0}); window.location.href = "index.html"; });
}
