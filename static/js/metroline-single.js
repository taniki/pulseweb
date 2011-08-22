var cluster_radius = 4;

function draw_metroline_single(canvas, stream){
	//console.log(canvas);
	
	$(canvas).attr("width", 220-12);
	$(canvas).attr("height", 20 * stream.get("height") );

	var c = canvas[0].getContext('2d');

	var clusters = stream.get("clusters");
	var links = stream.get("links");

	links.forEach(function(link){
		console.log(link);

		c.beginPath();

		var start_x = parseInt( link["start"]["x"] * ( 220 - 12 - (cluster_radius * 2) )  + cluster_radius);
		var start_y = parseInt( link["start"]["y"] * 20 + cluster_radius);

		var end_x = parseInt( link["end"]["x"] * ( 220 - 12 - (cluster_radius * 2) )  + cluster_radius);
		var end_y = parseInt( link["end"]["y"] * 20 + cluster_radius);
		
		c.moveTo(start_x, start_y);
		c.lineTo(end_x, end_y);

		// c.moveTo(start_x, start_y - cluster_radius);
		// c.lineTo(start_x + 4, start_y - cluster_radius);
		// c.lineTo(end_x - 4, end_y - cluster_radius);
		// c.lineTo(end_x, end_y - cluster_radius);
		// c.lineTo(end_x, end_y + cluster_radius);
		// c.lineTo(end_x - 4, end_y + cluster_radius);
		// c.lineTo(start_x + 4, start_y + cluster_radius);
		// c.lineTo(start_x, start_y + cluster_radius);
		c.lineWidth = 8;
		c.strokeStyle = colors_plain[ stream.get("id") % colors_plain.length ];
		c.stroke();
	});

	clusters.forEach(function(cluster){
		var x = parseInt( cluster["x"] * ( 220 - 12 - (cluster_radius * 2)) + 4 );
		var y = parseInt( cluster["y"] * 20 + cluster_radius);

		c.beginPath();
		c.arc(x, y, cluster_radius, 0, Math.PI*2,true);
		c.fillStyle = colors_plain[ stream.get("id") % colors_plain.length ];
		c.fill();

		c.beginPath();
		c.arc(x, y, cluster_radius, 0, Math.PI*2,true);
		c.fillStyle = 'rgba(255,255,255, 0.6)';
		c.fill();
	});

	return canvas;
}