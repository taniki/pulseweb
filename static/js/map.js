var po;
var map;

var s;

var current_dataset = null

var m = {
	load_cluster: function(cluster_id){
		if(current_dataset != null){
			map.remove(current_dataset);
		}

		$.getJSON("/data/cluster/"+cluster_id+"/geo", function(data){
			var geo_json = [];

			data.forEach(function(country){
				var p = {};
					p.geometry = { coordinates: [ country["capital_long"], country["capital_lat"] ], type: "Point" };
					p["w"] = country["weight"];
					p["cluster_id"] = cluster_id;
				geo_json.push(p);
			});

			var data = po.geoJson()
				.features(geo_json)
			    .zoom(5)
				.clip(false)
				.on("load", test_anim);

			map.add(data);
			
			current_dataset = data;
		});
	}
};

$(document).ready(function(){
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
	    // .url(po.url("http://127.0.0.1/1.0.0/pulseweb-africa_5a1596/{Z}/{X}/{Y}.png")));

	map.center( { lat: 0, lon: 40 } ).zoom(4);
	
	console.log("hum");
	
	data = po.geoJson()
		.features([{geometry: {coordinates: [ 40, 0 ], type: "Point"}}])
	    .zoom(5)
		.on("load", test_anim);
	
//	map.add(data);

	$(s).click(function(e){
		console.log("clic");
		$(s).animate({
			"width": "200"
		}, "slow");
		
		console.log($(s));
	})

});

function test_anim(e){
	var f = e.features;

	console.log(f.length);

	var tile = e.tile
	var g = tile.element;

	while (g.lastChild) g.removeChild(g.lastChild);
	
	var color = colors_plain[ clusters[ e.features[0]["data"]["cluster_id"] ]["stream"] % colors_plain.length ]

	f.forEach(function(p){
		var s = po.svg("circle");

		var point = g.appendChild(s);
		    point.setAttribute("cx", p.data.geometry.coordinates.x);
		    point.setAttribute("cy", p.data.geometry.coordinates.y);
		    point.setAttribute("r", parseInt( p.data.w / 6 ));
			point.setAttribute("fill", color);
			point.setAttribute("opacity", 0.8);
	});

}

