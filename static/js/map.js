var po;
var map;

var s;

var current_dataset = null

var m = {
	load_cluster: function(cluster_id){
		if(current_dataset != null){
			map.remove(current_dataset);
		}

		$("#viz .loading").css("display", "block");

		$.getJSON("/data/cluster/"+cluster_id+"/geo", function(data){
			var geo_json = [];

			data.forEach(function(country){
				var p = {};
					p.geometry = { coordinates: [ country["capital_long"], country["capital_lat"] ], type: "Point" };
					p["w"] = country["weight"];
					p["iso"] = country["iso"];
					p["cluster_id"] = cluster_id;
				geo_json.push(p);
			});

			var data = po.geoJson()
				.features(geo_json)
			    .zoom(5)
				.clip(false)
				.on("load", draw_clusters);

			map.add(data);
			
			current_dataset = data;
			
			$("#viz .loading").css("display", "none");
		});
	}
};

function draw_clusters(e){
	var f = e.features;

	console.log(f.length);

	var tile = e.tile
	var g = tile.element;

	while (g.lastChild) g.removeChild(g.lastChild);

	var color = colors_plain[ clusters[ e.features[0]["data"]["cluster_id"] ]["stream"] % colors_plain.length ]

	f.forEach(function(p){
		var volume = g.appendChild(po.svg("circle"));
		    volume.setAttribute("cx", p.data.geometry.coordinates.x);
		    volume.setAttribute("cy", p.data.geometry.coordinates.y);
		    volume.setAttribute("r", parseInt( p.data.w * 2 ));
			volume.setAttribute("fill", color);
			volume.setAttribute("opacity", 0.6);

		var border = g.appendChild(po.svg("circle"));
		    border.setAttribute("cx", p.data.geometry.coordinates.x);
		    border.setAttribute("cy", p.data.geometry.coordinates.y);
		    border.setAttribute("r", 40);
			border.setAttribute("fill", color);
			border.setAttribute("opacity", 0.9);

		var marker = g.appendChild(po.svg("circle"));
		    marker.setAttribute("cx", p.data.geometry.coordinates.x);
		    marker.setAttribute("cy", p.data.geometry.coordinates.y);
		    marker.setAttribute("r", 30);
			marker.setAttribute("fill", "#ffffff");
			marker.setAttribute("opacity", 1);

		var iso = g.appendChild(po.svg("text"));
		    iso.setAttribute("x", p.data.geometry.coordinates.x);
		    iso.setAttribute("y", p.data.geometry.coordinates.y);
		    // iso.setAttribute("dy", "1em");
		    iso.appendChild(document.createTextNode(p.data.iso));

		var val = g.appendChild(po.svg("text"));
		    val.setAttribute("x", p.data.geometry.coordinates.x);
		    val.setAttribute("y", p.data.geometry.coordinates.y);
		    val.setAttribute("dy", "1em");
		    val.appendChild(document.createTextNode( parseInt(p.data.w)));


	});

}

function init_map(){
		po = org.polymaps;

		map = po.map()
		    .container(document.getElementById("map").appendChild(po.svg("svg")))
			.add(po.interact())
			.zoomRange([3,6]);

		map.add(po.image()
		    .url(po.url("http://{S}tile.cloudmade.com"
		    + "/405f3b3b4b3c44ef9515fbac297bf25a" // http://cloudmade.com/register
		    + "/43678/256/{Z}/{X}/{Y}.png")		  // 
		    .hosts(["", "a.", "b.", "c.", ])));
	//	    .url(po.url("http://a.tiles.mapbox.com/mapbox/2.0.0/world-glass/{Z}/{X}/{Y}.png")));
	//	    .url(po.url("http://127.0.0.1:8888/1.0.0/pulseweb-africa_5a1596/{Z}/{X}/{Y}.png")));

		map.center( { lat: 0, lon: 40 } ).zoom(4);

		console.log("hum");
}

$(document).ready(function(){
	init_map();
//	map.add(data);

	$(s).click(function(e){
		console.log("clic");
		$(s).animate({
			"width": "200"
		}, "slow");
		
		console.log($(s));
	})

});

