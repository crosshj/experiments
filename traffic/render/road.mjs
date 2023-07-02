

/*

chunks should be rendered to offscreen and used later

https://stackoverflow.com/questions/43369748/how-to-render-offscreen-canvas-properly

OR

https://developers.google.com/web/updates/2018/08/offscreen-canvas

https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas

*/

function drawRoadChunk(ctx, chunk, center){
	const LINE_BROKEN = [3, 4];
	const LINE_BROKEN_CURVE = [4, 3];//[0, 7, 10, 10];
	const LINE_YELLOW = "#f8ca0d";
	const LINE_YELLOW_LIGHT = "#f8ca0d22";
	const LINE_WHITE = "#ffffff";
	const LINE_WHITE_LIGHT = "#888";
	const ROAD_COLOR = "#222";

	const piOver180 = 0.01745329252;

	ctx.save();
	//TODO: this is where center offset should occur (instead it's being included in chunk object)
	ctx.translate(
		chunk._x + center.x + chunk.width/2,
		chunk._y + center.y + chunk.height/2
	);
	//debugger

	ctx.rotate(chunk.rotate * Math.PI/180);

	ctx.setLineDash([]);
	ctx.fillStyle = ROAD_COLOR;
	ctx.strokeStyle = '#777';
	const base = {
		x: chunk.width * -0.5,
		y: chunk.height * -0.5
	};
	if(chunk.type === "straight"){
		ctx.fillRect(
			base.x-1,
			base.y + 5,
			chunk.width+1, chunk.height -10
		);
		// center lane lines
		ctx.lineWidth = "0.8";
		ctx.strokeStyle = LINE_YELLOW;
		ctx.beginPath();
		ctx.moveTo(base.x-1, base.y + chunk.height/2+1.2);
		ctx.lineTo(base.x + chunk.width+1, base.y + chunk.height/2+1.2);
		ctx.moveTo(base.x-1, base.y + chunk.height/2-1.2);
		ctx.lineTo(base.x + chunk.width+1, base.y + chunk.height/2-1.2);
		ctx.stroke();
		ctx.lineWidth = "1";

		//lower lanes dashed
		ctx.beginPath();
		ctx.strokeStyle = LINE_WHITE;
		ctx.setLineDash(LINE_BROKEN);
		ctx.moveTo(base.x, base.y + chunk.height/2 + 10);
		ctx.lineTo(base.x + chunk.width, base.y + chunk.height/2 + 10);
		ctx.stroke();

		//upper lanes dashed
		ctx.beginPath();
		ctx.strokeStyle = LINE_WHITE;
		ctx.setLineDash(LINE_BROKEN);
		ctx.moveTo(base.x, base.y + chunk.height/2 - 10);
		ctx.lineTo(base.x + chunk.width, base.y + chunk.height/2 - 10);
		ctx.stroke();

		// border lines
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.strokeStyle = LINE_WHITE;
		ctx.moveTo(base.x, base.y + chunk.height - 4);
		ctx.lineTo(base.x + chunk.width, base.y + chunk.height - 4);
		ctx.moveTo(base.x, base.y + 4);
		ctx.lineTo(base.x + chunk.width, base.y + 4);
		ctx.stroke();
	}

	if(chunk.type === "curved"){
		ctx.beginPath();
		ctx.moveTo(base.x-1, base.y + 5);
		// ctx.quadraticCurveTo(
		//     base.x + chunk.width -5, base.y + 5,
		//     base.x + chunk.width -5, base.y + chunk.height +1
		// );
		ctx.arc(base.x, base.y + chunk.height , 45, -90*piOver180, 0,  false);
		ctx.lineTo(base.x, base.y + chunk.height);
		ctx.quadraticCurveTo(
			base.x + 5, base.y + chunk.height - 5,
			base.x-1, base.y + chunk.height - 5
		);
		ctx.fill();

		// center lane lines
		ctx.lineWidth = "0.8";
		ctx.strokeStyle = LINE_YELLOW;
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.moveTo(base.x-1, base.y + chunk.height/2 -1.2);
		ctx.quadraticCurveTo(
			base.x + chunk.width/2+1, base.y + chunk.height/2,
			base.x + chunk.width/2+1.2, base.y + chunk.height+0.5
		);
		ctx.moveTo(base.x-1, base.y + chunk.height/2 +1.2);
		ctx.quadraticCurveTo(
			base.x + chunk.width/2-1, base.y + chunk.height/2+2,
			base.x + chunk.width/2-1.2, base.y + chunk.height+0.5
		);
		ctx.stroke();
		ctx.lineWidth = "1";

		// outer lanes dashed
		ctx.beginPath();
		ctx.strokeStyle = LINE_WHITE;
		ctx.setLineDash(LINE_BROKEN);
		ctx.moveTo(base.x, base.y + chunk.height/2 -10);
		ctx.quadraticCurveTo(
			base.x + chunk.width/2+10, base.y + chunk.height/2 -7,
			base.x + chunk.width/2+10, base.y + chunk.height
		);
		ctx.stroke();

		// inner lanes dashed
		ctx.beginPath();
		ctx.strokeStyle = LINE_WHITE;

		ctx.setLineDash(LINE_BROKEN_CURVE);
		ctx.moveTo(base.x, base.y + chunk.height/2 +10);
		ctx.quadraticCurveTo(
			base.x + chunk.width/2-10, base.y + chunk.height/2 +11,
			base.x + chunk.width/2-10, base.y + chunk.height
		);
		ctx.stroke();

		// outer lane border
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.strokeStyle = LINE_WHITE;
		ctx.moveTo(base.x, base.y + 4);
		// ctx.quadraticCurveTo(
		//     base.x + chunk.width -4, base.y + 5,
		//     base.x + chunk.width -4, base.y + chunk.height
		// );
		ctx.arc(base.x, base.y + chunk.height , 46, -90*piOver180, 0,  false);
		ctx.stroke();

		// inner lane border
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.strokeStyle = LINE_WHITE;
		ctx.moveTo(base.x + 4, base.y + chunk.height);
		ctx.quadraticCurveTo(
			base.x + 5, base.y + chunk.height - 5,
			base.x-1, base.y + chunk.height - 4
		);
		ctx.stroke();

		if(window.DEBUG){
			// indicators for road chunk rotation
			ctx.textAlign = "center";
			ctx.font = "100 8px serif";
			ctx.fillStyle = "#FFF";
			ctx.fillText(chunk.rotate || "0", chunk.width/2 -10, chunk.height/-2 + 15);
		}
	}

	if(chunk.type === "intersect" && Number(chunk.degree) === 4){
		ctx.fillRect(
			base.x,
			base.y + 5,
			chunk.width, chunk.height -10
		);
		ctx.fillRect(
			base.x + 5,
			base.y,
			chunk.width - 10, chunk.height
		);

		ctx.strokeStyle = LINE_WHITE_LIGHT;
		ctx.beginPath();
		ctx.setLineDash([0,5, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3]);
		ctx.moveTo(base.x + 5, base.y + 5);
		ctx.lineTo(base.x + chunk.width - 5, base.y + 5);

		ctx.lineTo(base.x + chunk.width - 5, base.y + chunk.height-5);
		ctx.lineTo(base.x + 5, base.y + chunk.height-5);
		ctx.lineTo(base.x + 5, base.y + 5);
		ctx.lineWidth = "7";
		ctx.stroke();

		// left lower lane border
		ctx.lineWidth = "1";
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.strokeStyle = LINE_WHITE;
		ctx.moveTo(base.x + 4, base.y + chunk.height);
		ctx.quadraticCurveTo(
			base.x + 5, base.y + chunk.height - 5,
			base.x-1, base.y + chunk.height - 4
		);
		ctx.stroke();

		// right lower lane border
		ctx.lineWidth = "1";
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.strokeStyle = LINE_WHITE;
		ctx.moveTo(base.x + chunk.width -4, base.y + chunk.height);
		ctx.quadraticCurveTo(
			base.x + chunk.width -4, base.y + chunk.height - 4,
			base.x + chunk.width, base.y + chunk.height - 4
		);
		ctx.stroke();

		// left upper lane border
		ctx.lineWidth = "1";
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.strokeStyle = LINE_WHITE;
		ctx.moveTo(base.x + 4, base.y);
		ctx.quadraticCurveTo(
			base.x + 4, base.y + 4,
			base.x, base.y + 4
		);
		ctx.stroke();

		// right upper lane border
		ctx.lineWidth = "1";
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.strokeStyle = LINE_WHITE;
		ctx.moveTo(base.x + chunk.width -4, base.y);
		ctx.quadraticCurveTo(
			base.x + chunk.width -4, base.y + 4,
			base.x + chunk.width, base.y + 4
		);
		ctx.stroke();
	}

	if(chunk.type === "intersect" && Number(chunk.degree) === 3){
		ctx.fillRect(
			base.x + 5,
			base.y + 5,
			chunk.width-5, chunk.height -10
		);
		ctx.fillRect(
			base.x + 5,
			base.y,
			chunk.width - 10, chunk.height
		);

		ctx.strokeStyle = LINE_WHITE_LIGHT;
		ctx.beginPath();
		ctx.setLineDash([0,5, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3]);
		ctx.moveTo(base.x + 5, base.y + 5);
		ctx.lineTo(base.x + chunk.width - 5, base.y + 5);

		ctx.lineTo(base.x + chunk.width - 5, base.y + chunk.height-5);
		ctx.lineTo(base.x + 5, base.y + chunk.height-5);
		ctx.lineWidth = "7";
		ctx.stroke();

		// straight border lines
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.lineWidth = "1";
		ctx.strokeStyle = LINE_WHITE;
		ctx.moveTo(base.x+4, base.y);
		ctx.lineTo(base.x+4, base.y + chunk.height);
		ctx.stroke();

		// right lower lane border
		ctx.lineWidth = "1";
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.strokeStyle = LINE_WHITE;
		ctx.moveTo(base.x + chunk.width -4, base.y + chunk.height);
		ctx.quadraticCurveTo(
			base.x + chunk.width -4, base.y + chunk.height - 4,
			base.x + chunk.width, base.y + chunk.height - 4
		);
		ctx.stroke();

		// right upper lane border
		ctx.lineWidth = "1";
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.strokeStyle = LINE_WHITE;
		ctx.moveTo(base.x + chunk.width -4, base.y);
		ctx.quadraticCurveTo(
			base.x + chunk.width -4, base.y + 4,
			base.x + chunk.width, base.y + 4
		);
		ctx.stroke();
	}

	ctx.restore();
}

function MapChunk(ctx, chunk, center, stage){
	const { x, y, _x, _y, type, size } = chunk;
	ctx.setLineDash([]);
	ctx.lineWidth = "1";

	if(type){
		//console.log(chunk);
		drawRoadChunk(
			ctx,
			{ ...chunk, ...{ width: size, height: size } },
			center
		);
		return;
	}
	if(!window.DEBUG){
		return;
	}
	// text label for chunk index
	ctx.textAlign = "center";
	ctx.font = "12px Monospace";
	ctx.fillStyle = "#555";
	ctx.fillText(chunk.index, _x+size/2, _y+size/2);

	//return;
	//bottom-right border
	ctx.strokeStyle = '#990000';
	ctx.beginPath();
	ctx.moveTo(_x, _y+size-2);
	ctx.lineTo(_x+size-1.5, _y+size-2);
	ctx.lineTo(_x+size-1.5, _y);
	ctx.stroke();

	//left-top border
	ctx.strokeStyle = 'green';
	ctx.beginPath();
	ctx.moveTo(_x+0.5, _y+size-1);
	ctx.lineTo(_x+0.5, _y);
	ctx.lineTo(_x+1+size-1, _y);
	ctx.stroke();


}

export {
	MapChunk as draw
}
