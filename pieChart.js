// создать функцию сыязывающие design и основной код

// date = new Date();
date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8);

let on = false;
let thatTime = 0; 
let lastTime = 0;
let newTime = 0;
let lastAct;
let newAct;

let myCanvas = document.getElementById("myCanvas");
myCanvas.width = 339;
myCanvas.height = 339;
let ctx = myCanvas.getContext("2d");

function drawLine(ctx, startX, startY, endX, endY){
    ctx.beginPath();
	ctx.moveTo(startX,startY);
	ctx.lineTo(endX,endY);
	ctx.stroke();
}

function drawArc(ctx, centerX, centerY, radius, startAngle, endAngle){
    ctx.beginPath();
	ctx.arc(centerX, centerY, radius, startAngle, endAngle);
	ctx.stroke();
}

function drawPieSlice(ctx,centerX, centerY, radius, startAngle, endAngle, color ){
    ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(centerX,centerY);
	ctx.arc(centerX, centerY, radius, startAngle, endAngle);
	ctx.closePath();
	ctx.fill();
}

let Piechart = function(options){
	console.log(getPlans()['First'])
    this.options = options;
	this.canvas = options.canvas;
	this.ctx = this.canvas.getContext("2d");
	this.colors = options.colors;
	this.draw = function(){
		let color_index = 0;
		let start_angle = ((((date.getHours()-3)*60)+date.getMinutes())*0.5)/57.3;   //2.6182 (8 часов);
		let duration_angle;

		for (let categ of this.options.data){ 
			//console.log(categ)
			categ.ending = new Date(+categ.start + categ.duration);
            if(this.options.data[0] == categ){
                start_angle = Math.max(((((date.getHours()-3)*60)+date.getMinutes())), (((categ.start.getHours()-3)*60+categ.start.getMinutes())))*0.5/57.3
            };
            if((date.getHours()*60+date.getMinutes())<((categ.ending.getHours()*60+categ.ending.getMinutes()))){ 
				duration_angle = ((categ.ending.getHours()*60+categ.ending.getMinutes())-
			    Math.max((categ.start.getHours()*60+categ.start.getMinutes()), (((date.getHours())*60)+date.getMinutes())))*0.5/57.3;

				if(start_angle+duration_angle > (((date.getHours()-3)*60+date.getMinutes()+720)*0.5/57.3)){
				 	duration_angle = (((date.getHours()-3)*60+date.getMinutes()+720)*0.5/57.3) - start_angle;
				}
			    drawPieSlice(
				    this.ctx,
				    this.canvas.width/2,
				    this.canvas.height/2,
				    Math.min(this.canvas.width/2,this.canvas.height/2),
				    start_angle, 
				    start_angle+duration_angle,
				    this.colors[color_index%this.colors.length]
			    );
                start_angle+=((categ.ending.getHours()*60+categ.ending.getMinutes())-
                Math.max((categ.start.getHours()*60+categ.start.getMinutes()), (((date.getHours())*60)+date.getMinutes())))*0.5/57.3,
			    color_index++;
			}
        }
	}
}


let myPiechart = new Piechart(
    {
		canvas:myCanvas,
		data:getPlans()['First'],
		colors:["#0000ff", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#ff00ff", "#ffaa00", "#e0e0e0", "#000000"]
	}
);

let contentLoaded = new Promise(function (resolve, reject) {
	document.addEventListener("DOMContentLoaded", () => {
	     resolve();
	})

});

contentLoaded.then(function () {
	myPiechart.draw();
	
});


clickzone.onmousedown = function click(event){
	on = true;
	whatTime(event);
	lastTime = thatTime;
    whatActDown(lastTime);
    
	clickzone.onmouseout = function click2(){on = false}
	
}

clickzone.onmouseup = function move(event){
	if (on){
	    whatTime(event);
	    newTime = thatTime;
		whatActUp(newTime);
		on = false;
		chart.innerHTML = ((lastTime/60)).toFixed(1); 
	}
	if (''){
//  newTime < сейчас => удалить из сегодня;
	}else if(''){
//  newTime > сейчас => перенести на завтра;
	}else if (lastAct !== newAct){
	    
	}
}

function whatTime(event){
		let x = (event.pageX-(myCanvas.width/2+myCanvas.style.left));
		let y = (event.pageY-(myCanvas.height/2+myCanvas.style.top));
		if (x<0 && y<0){x = -x; y = -y;
			thatTime = Math.atan(y/x)*57.3*2;
			if((thatTime < 60)&&((date.getHours()*60+date.getMinutes())>(thatTime+540))){
				thatTime = thatTime + 1260; // 9 - 12   
			}else{thatTime = 540 + thatTime;} 
			x = -x; y = -y;
		} 
		if (x<0 && y>0){x = -x;
			thatTime = Math.atan(y/x)*57.3*2;
			if((thatTime < 60)&&((date.getHours()*60+date.getMinutes())<(540-thatTime))){
				thatTime =  540 - thatTime; // 6 - 9
			}else{thatTime = 1260 - thatTime;}
			x = -x;
		} 
		if (x>0 && y>0){
			thatTime = Math.atan(y/x)*57.3*2;
			thatTime = 900 + thatTime;// 3 - 6
		} 
		if (x>0 && y<0){y = -y;
			thatTime = Math.atan(y/x)*57.3*2;
			thatTime = 900 - thatTime;// 12 - 3
			y = -y;
		} 
}	

function whatActUp(Time) {
	for (let Act of getPlans()['First']){
		Act.ending = new Date(+Act.start + Act.duration);
		if((Act.start.getHours()*60+Act.start.getMinutes()) < Time && (Act.ending.getHours()*60+Act.ending.getMinutes()) > Time){     
			newAct = Act;
		}
	}
}
function whatActDown(Time) {
    for (let Act of getPlans()['First']){
		Act.ending = new Date(+Act.start + Act.duration);
		if((Act.start.getHours()*60+Act.start.getMinutes()) < Time && (Act.ending.getHours()*60+Act.ending.getMinutes()) > Time){
		    lastAct = Act;	
		}
	}
}
