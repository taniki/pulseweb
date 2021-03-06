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
					p["name"] = country["name"];
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

	var color = colors_plain[ clusters[ e.features[0]["data"]["cluster_id"] ]["group"] % colors_plain.length ]

	f.forEach(function(p){


		var marker = g.appendChild(po.svg("circle"));
		    marker.setAttribute("cx", p.data.geometry.coordinates.x);
		    marker.setAttribute("cy", p.data.geometry.coordinates.y);
			marker.setAttribute("r", 24);
			marker.setAttribute("class", "marker");
			marker.setAttribute("fill", color);
			marker.setAttribute("opacity", 1);
			marker.setAttribute("data-iso", p.data.iso);
			marker.setAttribute("data-cluster_id", p.data.cluster_id);


		if(p.data.w < 10){
			marker.setAttribute("r", 12);
		} else {
			var volume = g.insertBefore(po.svg("circle"), marker);
				//volume.insertBefore(marker);
			    volume.setAttribute("cx", p.data.geometry.coordinates.x);
			    volume.setAttribute("cy", p.data.geometry.coordinates.y);
			    volume.setAttribute("r", parseInt( p.data.w * 2.2 ));
				volume.setAttribute("fill", color);
				volume.setAttribute("opacity", 0.6);

			var val = g.appendChild(po.svg("text"));
			    val.setAttribute("x", p.data.geometry.coordinates.x);
			    val.setAttribute("y", p.data.geometry.coordinates.y);
			    val.setAttribute("dy", "6px");
			    val.appendChild(document.createTextNode( parseInt(p.data.w)));
		}

		var iso = g.appendChild(po.svg("text"));
		    iso.setAttribute("x", p.data.geometry.coordinates.x);
		    iso.setAttribute("y", p.data.geometry.coordinates.y);
		    iso.setAttribute("dy", "-1.2em");
		    iso.appendChild(document.createTextNode(p.data.name));

		$(marker).click(function(e){
			console.log([ p.data.cluster_id, p.data.iso ]);
			explorer.open_country(p.data.cluster_id, p.data.iso);
		});

	});

}

function init_map(){
		po = org.polymaps;

		map = po.map()
		    .container(document.getElementById("map").appendChild(po.svg("svg")))
			.add(po.interact())
			.zoomRange([3,5]);

		map.add(po.image()
		    .url(po.url('http://tiles.formism.net/2.0.0/pulseweb/{Z}/{X}/{Y}.png')));

		map.center( { lat: 0, lon: 40 } ).zoom(4);

		$("#viz .ui .zoom").click(function(e){
			map.zoomBy(+1);
		});
		$("#viz .ui .dezoom").click(function(e){
			map.zoomBy(-1);
		});


		console.log("hum");
}

$(document).ready(function(){
	init_map();
});

