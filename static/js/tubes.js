paper.install(window);

var viz_is_ready = false

var project_tubes;

// var colors_plain = [ "#00aeef", "#cf5c42", "#e1f4fd", "#f4d5e3", "#e1d8ad" ]
var colors_plain = [
	"#00aeef",
	"#cf5c42",
	"#BE5993",
	"#81A93E",
	"#E2CD12",
	"#DE9312",
	"#DE9312",
	"#303285"
]

var clusters = {}

var layer_clusters;
var layer_links;
var layer_background;

var viz_elements;
var control_elements;

var timeline_width = 4000;
var x_y_ratio = 1.8;

var day_pixels = timeline_width / 4198;

var global_move = { x:0, y:0 }

var global_scale = 1;
var global_scale_motion = 0;

var cluster_hover;

var selected = {
	stream: 0,
	cluster: 0
};


window.onload = function() {
	$("#tubes").attr("width", $(window).width() - 242);
	$("#tubes").attr("height", $(window).height() );

	$(".viz").attr("width", $(window).width() - 242);
	$(".viz").attr("height", $(window).height() );

	project_tubes = new Project()
	project_tubes.activate();

	var canvas = document.getElementById('tubes');
	paper.setup(canvas);

	layer_background	= new Layer();
	layer_clusters		= new Layer();
	layer_links			= new Layer();

	viz_elements = new Group;

	draw_background();

	get_distribution();
    get_clusters();

	var tool = new Tool();

	tool.onMouseDown = function(event) {
	    var hitResult = project.hitTest(event.point);

	    if (hitResult && hitResult.item && hitResult.item.cluster_id){
			var c = clusters[hitResult.item.cluster_id];
		
			select_cluster(c);
			pan_to_cluster(c);
			sidenav.select(c["stream"]);
			explorer.load_cluster(c["id"])
		}
	}
	
	tool.onMouseMove = function(event) {
	    var hitResult = project.hitTest(event.point);

		cluster_hover = null

		for(var c in clusters){
//			clusters[c]["path"].fillColor.alpha = 0.6;
			if( !clusters[c]["selected"]){
				clusters[c]["path"].strokeColor	= null;
			}
		}

	    if (hitResult && hitResult.item && hitResult.item.cluster_id){
			hover_cluster(clusters[hitResult.item.cluster_id]);
		}
	}
	
	tool.onMouseDrag = function(event) {
		//console.log("drag");
		pan_of( event.delta.x , event.delta.y )
	}
	
	tool.onKeyDown = function(e){
		if(e.key == "+"){ 
			zoom(0.1);
		}
		else if(e.key == "-"){
			dezoom(0.1);
		}
	}	
	
	$("#viz .ui .zoom").click(function(e){ zoom(0.1); });
	$("#viz .ui .dezoom").click(function(e){ dezoom(0.1); });
	
	view.onResize = function(e){
//		layer_background;
	}
	
	view.onFrame = function(){
		if(global_move["x"] != 0 || global_move["y"] != 0){
			global_move["x"] = Math.ceil( (global_move["x"]) / 2);
			global_move["y"] = Math.ceil( (global_move["y"]) / 2);

			// hahahahahahaarrrrggg
			if (global_move["x"] == 1) global_move["x"] = 0
			if (global_move["y"] == 1) global_move["y"] = 0

			pan_of(global_move["x"], global_move["y"]);
		}
		
		if(cluster_hover){
			// clusters[cluster_hover]["path"].rotate(3);
		}
	}
}

function pan_of(x,y){
	layer_clusters.position = layer_clusters.position.add( [x, y]) ;
	layer_links.position = layer_links.position.add( [x, y] ) ;
	layer_background.position = layer_background.position.add( [x, 0] ) ;
	
	view.draw();
}

function pan_to_cluster(cluster){
	var c = cluster;

	var x = view.center.x - c["path"]["position"]["x"]; //parseInt( view.size.width  / 2 );
	var y = view.center.y - c["path"]["position"]["y"]; //parseInt( view.size.height / 2 );

	///pan_of(x,y);

	global_move["x"] += x;
	global_move["y"] += y;
}

function zoom(factor){
	if(global_scale < 1){
		global_scale += factor;

		var coeff = 1 / (1 - factor);
		var scale_center = view.center; //new Point( 0, 0 );
	
		layer_clusters.scale( coeff,  scale_center);
		layer_links.scale( coeff,  scale_center);
		layer_background.scale( coeff, [ scale_center.x, 0 ]);
	}
}

function dezoom(factor){
	if(global_scale > 0){
		global_scale -= factor;

		var coeff = 1 - factor;
		var scale_center = view.center; // new Point( 0, 0 );

		layer_clusters.scale( coeff,  scale_center);
		layer_links.scale( coeff,  scale_center);
		layer_background.scale( coeff, [ scale_center.x, 0 ]);
	}
}

function draw_background(){
	layer_background.activate();
	
	// BEURK
	var h = 3000; //view.size.height;

	for(var y = 0;  y < 12; y++){
		var x = parseInt( y * 360 * day_pixels) + 0.5;

		var p = new Path();
			p.add( [ 100 + x, 0 ]);
			p.add( [ 100 + x, h ]);
			p.strokeColor = "#dddddd";
			p.strokeWidth = 1;

		var label = new PointText( new Point( x + 6 + 100, 30) );
			label.characterStyle = {
				font: "Varela",
				fontSize: 24,
				fillColor: "black"
			};
			label.paragraphStyle = {
				justification: 'left'
			};
			label.content = 2000 + y;

		//console.log(p);
	}
	
}

function get_distribution(){
	$.getJSON("/data/distribution/articles/by_month", {}, function(data){
		draw_distribution_articles_by_month(data);
	});
}

function draw_distribution_articles_by_month(d){
	layer_background.activate();
	
	Object.keys(d).forEach(function(year){
		Object.keys(d[year]).forEach(function (month){
			//console.log( year - 2000);
			point = new Point( parseInt( ( 360 * ( year - 2000) + 30 * (month - 1)) * day_pixels) + 100 + 1, 38);
			size = new Size( 29 * day_pixels, parseInt( d[year][month] / 5) + 10);
			var r = new Path.Rectangle(point, size);
			r.fillColor= "#dddddd"

			var label = new PointText( point.add( [ 15*day_pixels, 9] ));
			label.characterStyle = {
				font: "verdana",
				fontSize: 6,
				fillColor: "#777"
			};
			label.paragraphStyle = {
				justification: 'center'
			};
			label.content = d[year][month];

		});
	});
}


function get_clusters(){
	$.getJSON("/data/clusters", {}, function(data){
		layer_clusters.activate();

		var cluster_box_width = 0;

	    data.forEach(function(c){
			var current = {};
				// console.log(c);
			
				current['x'] = parseInt(  c["x_norm"]	* timeline_width) + cluster_box_width + 100;
				current['y'] = parseInt( (c["y"]		* timeline_width)/x_y_ratio );
//				current['x'] = parseInt( day_pixels * c["end"] ) + cluster_box_width + 100;

				current['w'] = Math.max( parseInt( (c["w"]/c["period_length"]) * 20), 20 );
				current['s'] = parseInt(c["w"]);

				current['group'] = c["group_id"];				
				current['stream'] = c["stream_id"];
				current['id'] = c["id"];

				// TODO Si quelqu'un sait calculer cette couleur sans faire le boulet. YURWELCOME.
				var b = new Path.Circle( [ current['x'], current['y'] ], current['w']);
				b.fillColor = colors_plain[ current["group"] % colors_plain.length ];
				b.strokeWidth = 0;

				current['path'] = new Path.Circle( [ current['x'], current['y'] ], current['w']);
//				current['path'] = new Path.Rectangle( current['x'] - cluster_box_width/2, current['y'] - current['w'], cluster_box_width, 2 * current['w']);
				current['path'].fillColor = '#ffffff';
				current['path'].fillColor.alpha = 0.6;
				current['path'].strokeWidth = 0;
				current['path'].strokeColor = null;
				current['path'].main_color = b.fillColor;

				current['path'].addChild(b);

				current['label'] = new PointText( new Point(current['x'], current['y'] + 3 ));
				current['label'].characterStyle = {
					font: "verdana",
					fontSize: 7,
					fillColor: "black"
				};
				current['label'].paragraphStyle = {
					justification: 'center'
				}
				current['label'].content = c["label"];

				current['label_width'] = new PointText( new Point(current['x'], current['y'] + 14 ));
				current['label_width'].characterStyle = {
					font: "verdana",
					fontSize: 6,
					fillColor: "black"
				};
				current['label_width'].paragraphStyle = {
					justification: 'center'
				}
				
				current["density"] = c["w"] / c["period_length"];
				
				current['label_width'].content = current["s"];

				current['path'].cluster_id = c["id"];
				
			clusters[c["id"]] = current;
		});

		layer_clusters.visible = true;

		get_links();
	});
}

function hover_cluster(cluster){
	var p = cluster["path"];
	
	p.strokeWidth		= 10;
	p.strokeColor		= "#444";
	p.strokeColor.alpha	= 0.7;
	
	cluster_hover = cluster["id"];
}

function select_cluster(c){
	for(var cluster in clusters){
		clusters[cluster].selected = false;
		clusters[cluster]["path"].strokeColor	= null;
	}

	hover_cluster(c);
	c.selected = true;
	
	selected.stream = c["stream"];
	selected.cluster = c["id"];
	
	update_all_metrolines();
//	console.log(c);
}

function get_links(){
	$.getJSON("/data/clusters/links", {}, function(data){
		// console.log(clusters);
		
		layer_links.activate();
		
	    data.forEach(function(c){
				var smooth_distance = 5;
				var smooth_force = 30;
			
				var previous = clusters[c["previous"]];
				var current = clusters[c["current"]];

				var start = new Point( previous["x"], previous["y"] );
				var end = new Point( current["x"], current["y"] );

				var p = new Path();
					p.add(start.add([ 0, - previous["w"] ]));
					p.add(
						new Segment(
							start.add([ smooth_distance, - previous["w"] ]),
							{x: 0, y: 0},
							{x: smooth_force, y: 0}
						)
					);
					p.add(
						new Segment(
							end.add([ - smooth_distance, - current["w"] ]),
							{x: -smooth_force, y: 0},
							{x: 0, y: 0}
						)
					);
					p.add(end.add([ 0, - current["w"] ]));
					p.add(end.add([ 0, + current["w"] ]));
					p.add(
						new Segment(
							end.add([ - smooth_distance, + current["w"] ]),
							{x: 0, y: 0},
							{x: -smooth_force, y: 0}
						)
					);
					p.add(
						new Segment(
							start.add([ smooth_distance, + previous["w"] ]),
							{x: smooth_force, y: 0},
							{x: 0, y: 0}
						)
					);
					p.add(start.add([ 0, + previous["w"] ]));
				p.fillColor = colors_plain[ previous["group"] % colors_plain.length ];
				p.fillColor.alpha = 0.9;

		});

		layer_links.moveBelow(layer_clusters);
		layer_background.moveBelow(layer_links);

//		layer_clusters.scale(0.5, new Point(0, 0));
//		layer_links.scale(0.5, new Point(0, 0));
//		pan_of(-1500, -300);
		// pan_to_cluster(clusters[158]);

		view.draw();
		
		// Soon an event dispatcher to not mess between js spaces
		viz_is_ready = true;
		
		if(nav_is_ready){
			Backbone.history.start({pushState: true, root: "/tubes/"});
		}
	});	
}

function move_clusters(e){
    var hitResult = project.hitTest(e.point);

	if(hitResult){
		var item = hitResult.item;
		item.selected = true;
	}
}