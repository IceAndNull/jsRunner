var UpdateList = [];
var DrawList = [];

var mouseX = 0;
var mouseY = 0;

var fps = 60;

var currentSpeed;
var resetSpeed = 10;

var runner;

var timescale = 1;

var doAlert = false;

var timeKeyHeld = false;
var totalSlowedTime = 0;
var slowed = false;

var maxSlowTime = 3;

//Runner.js: basically the dinosaur game

document.body.setAttribute("style", "overflow: hidden;background:#add8e6;");

var heldKeys={};
var walls = [];
var clouds = [];

function toggleSlowDown(){
    if(!slowed){
        timescale = 0.5;
        slowed = true;
    }
    else{
        timescale = 1;
        slowed = false;
    }
}

function doLoseMessage(points){
    if(doAlert){
        if(points <= 5){
            alert("u lost with "+points.toString()+" points lmao noob");
        }
        else if(points <= 10){
            alert("u lost with "+points.toString()+" points ur bad");
        }
        else if(points <= 15){
            alert("u lost with "+points.toString()+" points ok");
        }
        else if(points <= 20){
            alert("u lost with "+points.toString()+" points not bad");
        }
        else if(points <= 25){
            alert("u lost with "+points.toString()+" points pretty good");
        }
        else{
            alert("u lost with" + points.toString() + " points thats pretty cool good job");
        }
    }
}

function timeScaleMoveMulti(){
    if(slowed){
        return 1.5;
    }
    else{
        return 1;
    }
}

function lose(){
        currentSpeed = resetSpeed;
        removeWalls();
        doLoseMessage((currentSpeed - 10)*2);
        totalSlowedTime = 0;
        if(slowed){
            toggleSlowDown();
        }
}

window.onkeydown=function(e){
     e = e || window.event;
     heldKeys[e.keyCode] = true;
};

window.onkeyup=function(e){
     e = e || window.event;
     delete heldKeys[e.keyCode];
};

function mouseMove(mouseEvent){
	mouseX = mouseEvent.pageX;
    mouseY = mouseEvent.pageY;
}

document.onmousemove = mouseMove;

function removeWalls(){
    walls.forEach(function(wall){
        removeThing(wall);
    });
    walls = [];
}

class Thing{
    constructor(xpos, ypos, setWidth, setHeight, setColor, setImg){
    	this.x = xpos;
        this.y = ypos;
        this.width = setWidth;
        this.height = setHeight;
        this.color = setColor;
		this.img = setImg;
    }
    Update(){

    }
    touching(otherThing)
    {
    	var isTouching = (otherThing.x < this.x + this.width && this.x < otherThing.x + otherThing.width && otherThing.y < this.y + this.height && this.y < otherThing.y + otherThing.height);
        /*if(isTouching){
        	console.log("touching");
        }
        else{
        	console.log("not touching");
        }*/
    	return isTouching;
    }
}

class Runner extends Thing{
    constructor(){
        super(200, document.body.offsetHeight - 100, 10, 20, "red", "");
        currentSpeed = resetSpeed;
        this.yBaseHeight = this.y;
        this.yvel = 0;
    }
    Update(){
        runner = this;
        if(heldKeys[16]){
            if(!timeKeyHeld){
                timeKeyHeld = true;
                toggleSlowDown();
            }
        }
        else{
            timeKeyHeld = false;
        }
        if(slowed){
            totalSlowedTime += 1 / fps;
        }
        else if(totalSlowedTime > 0){
            totalSlowedTime -= 1 / fps;
        }
        else{
            totalSlowedTime = 0;
        }
        if(totalSlowedTime >= maxSlowTime){
            toggleSlowDown();
        }
        if(this.y > this.yBaseHeight){
            this.y = this.yBaseHeight;
        }
        if(this.y == this.yBaseHeight){
            if(heldKeys[32] || heldKeys[87] || heldKeys[38]){
                this.yvel = 10 / (fps / 60);
            }
            else{
                this.yvel = 0;
            }
        }
        else{
            if(heldKeys[32] || heldKeys[87] || heldKeys[38]){
                this.yvel -= 0.5 / (fps / 60) * timescale / timeScaleMoveMulti();
            }
            else if(heldKeys[83] || heldKeys[40]){
                this.yvel -= 1.5 / (fps / 60) * timescale * timeScaleMoveMulti();
            }
            else{
                this.yvel -= 0.8 / (fps / 60) * timescale;
            }
        }
        this.y -= this.yvel * timescale;
        if(this.y > this.yBaseHeight){
            this.y = this.yBaseHeight;
        }
        //console.log(this.yvel);
    }
}

class AbilityTimer extends Thing{
    constructor(){
        super(document.body.offsetWidth / 2 - 50, 50, 100, 15, "green", "");
    }
    Update(){
        this.width = (maxSlowTime-totalSlowedTime) * (200 / maxSlowTime);
        this.x = document.body.offsetWidth / 2 - (this.width / 2);
    }
}

class Wall extends Thing{
    constructor(setHeight){
        super(document.body.offsetWidth, document.body.offsetHeight - 80 - setHeight, 15, setHeight, "black", "");
        this.addedPoint = false;
        walls.push(this);
    }
    Update(){
        this.x -= currentSpeed / (fps / 60) * timescale;
        if(this.x + this.width <= 0){
            walls.splice(walls.indexOf(this), 1);
            removeThing(this);
        }
        if(this.touching(runner)){
            lose();
            //removeThing(runner);
        }
        else if(this.x + this.width < runner.x && !this.addedPoint){
            this.addedPoint = true;
            currentSpeed += 0.5;
        }
    }
    touching(otherThing)
    {
    	var isTouching = (otherThing.x < this.x + this.width && this.x - currentSpeed < otherThing.x + otherThing.width && otherThing.y < this.y + this.height && this.y < otherThing.y + otherThing.height);
        /*if(isTouching){
        	console.log("touching");
        }
        else{
        	console.log("not touching");
        }*/
    	return isTouching;
    }
}

class Cloud extends Thing{
    constructor(setWidth){
        super(document.body.offsetWidth, Math.random() * 350 + 50, setWidth, 40, "White", "");
        clouds.push(this);
        this.speedMulti = (Math.random() / 4) + 0.875;
    }
    Update(){
        this.x -= ((currentSpeed * this.speedMulti / (fps / 60)) / 2) * timescale;
        if(this.x + this.width <= 0){
            clouds.splice(clouds.indexOf(this), 1);
            removeThing(this);
        }
    }
}

class Manager{
    constructor(baseChance){
        this.baseChance = baseChance;
        this.chanceperframe = this.baseChance / fps;
    }
    Update(){
        this.chanceperframe = (this.baseChance / fps) * (resetSpeed / currentSpeed) * timescale;
        if(Math.random() <= this.chanceperframe && runner !== null){
            addThing(new Wall(Math.random()*50 + 25));
        }
        if(Math.random() <= this.chanceperframe * 0.7 && runner !== null){
            addThing(new Cloud(Math.random() * 100 + 50));
        }
        /*if(runner === null && heldKeys[resetKey]){
            addThing(new Runner());
        }*/
        if(slowed){
            document.body.setAttribute("style", "overflow: hidden;background:rgb("+Math.floor(totalSlowedTime * (173/(maxSlowTime*2))+173/2).toString()+", "+Math.floor(totalSlowedTime * (216/(maxSlowTime*2))+216/2).toString()+", "+Math.floor(totalSlowedTime * (230/(maxSlowTime*2))+230/2).toString()+");");
        }
        else{
            document.body.setAttribute("style", "overflow: hidden;background:#add8e6;");
        }
    }
}

class Floor extends Thing{
    constructor(color){
        super(0, document.body.offsetHeight - 80, document.body.offsetWidth, 5, color, "");
    }
    Update(){
        this.width = document.body.offsetWidth;
    }
}

function drawAll(){
	//document.body.innerHTML = "";
    DrawList.forEach(function(currentThing) {
    	if(currentThing.img !== ""){
        	document.body.innerHTML += "<img style=\"width: "+currentThing.width.toString()+"; height: "+currentThing.height.toString()+"; position:absolute; left:"+currentThing.x.toString()+"; top: "+currentThing.y.toString()+";\" src=\""+currentThing.img+"\"></img>";
        }
        else{
        	document.body.innerHTML += "<div style=\"background:"+currentThing.color+"; width: "+currentThing.width.toString()+"; height: "+currentThing.height.toString()+"; position:absolute; left:"+currentThing.x.toString()+"; top: "+currentThing.y.toString()+";\"></div>";
        }
	});
}

function updateAll(){
	UpdateList.forEach(function(currentThing) {
    	currentThing.Update();
	});
}

function addThing(addingThing){
	UpdateList.push(addingThing);
    DrawList.push(addingThing);
}

function removeThing(removingThing){
	//throw new Exception();
	UpdateList.splice(UpdateList.indexOf(removingThing), 1);
	DrawList.splice(DrawList.indexOf(removingThing), 1);
}

function loop(){
    document.body.innerHTML = "Points: "+((currentSpeed - 10)*2).toString();
	updateAll();
    drawAll();
	setTimeout(loop, 1000/fps);
}

addThing(new Runner());

addThing(new Floor("green"));

addThing(new AbilityTimer());

UpdateList.push(new Manager(1));

loop();
