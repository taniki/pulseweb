var cluster_radius = 4;

var mouseX;
var mouseY;

var mouseDown = false;

function init_metroline_single(canvas, stream){

	$(canvas).attr("width", 220-12);
	$(canvas).attr("height", 20 * stream.get("height") );

	if(isNaN(stream.get("height"))){
		$(canvas).attr("height", 10 );
	}

	draw_metroline_single(canvas, stream);
	
	canvas.addEventListener("mousemove", function(e){

		mouseX = e.offsetX;
		mouseY = e.offsetY;
		
		draw_metroline_single(canvas, stream);
	});
	
	canvas.addEventListener("click", function(e){

		mouseX = e.offsetX;
		mouseY = e.offsetY;
		
		mouseDown = true;
		
		draw_metroline_single(canvas, stream);

		mouseDown = false;
	});
	
	return canvas;
}

function draw_metroline_single(canvas, stream){
	var c = canvas.getContext('2d');

    c.clearRect(0,0,canvas.width,canvas.height);

	var _clusters = stream.get("clusters");
	var links = stream.get("links");

	links.forEach(function(link){
//		console.log(link);

		c.beginPath();

		var start_x = parseInt( link["start"]["x"] * ( 220 - 12 - (cluster_radius * 2) )  + cluster_radius);
		var start_y = parseInt( link["start"]["y"] * 20 + cluster_radius);

		var end_x = parseInt( link["end"]["x"] * ( 220 - 12 - (cluster_radius * 2) )  + cluster_radius);
		var end_y = parseInt( link["end"]["y"] * 20 + cluster_radius);
		
		c.moveTo(start_x, start_y);
		c.lineTo(end_x, end_y);

		c.lineWidth = 8;
		c.strokeStyle = colors_plain[ stream.get("id") % colors_plain.length ];
		c.stroke();
	});

	_clusters.forEach(function(cluster){
		var x = parseInt( cluster["x"] * ( 220 - 12 - (cluster_radius * 2)) + 4 );
		var y = parseInt( cluster["y"] * 20 + cluster_radius);

		c.beginPath();
		c.arc(x, y, cluster_radius, 0, Math.PI*2,true);
		c.fillStyle = colors_plain[ stream.get("id") % colors_plain.length ];
		c.fill();

		c.beginPath();
		c.arc(x, y, cluster_radius, 0, Math.PI*2,true);
		
		var alpha = 0.6

		if(c.isPointInPath(mouseX, mouseY)){
			alpha = 1;
		}

		if(c.isPointInPath(mouseX, mouseY) && mouseDown){
			select_cluster(clusters[cluster["id"]]);
			pan_to_cluster(clusters[cluster["id"]]);
			
			sidenav.select(stream["id"]);
		}

		c.fillStyle = 'rgba(255,255,255,'+ alpha +')';
		c.fill();
	});

	return canvas;
}