paper.install(window);

window.onload = function() {
	var canvas = document.getElementById('tubes');
	paper.setup(canvas);

	layer_background = new Layer();
	layer_clusters = new Layer();
	layer_links = new Layer();

	viz_elements = new Group;

	draw_background();
    get_clusters();

	var tool = new Tool();

	tool.onMouseDown = function(event) {
	}
	
	tool.onMouseDrag = function(event) {
		//console.log("drag");
		layer_clusters.position = layer_clusters.position.add( event.delta) ;
		layer_links.position = layer_links.position.add( event.delta) ;
		layer_background.position = layer_background.position.add( [ event.delta.x, 0] ) ;
	}
}

var colors_plain = [ "#00aeef", "#cf5c42", "#e1f4fd", "#f4d5e3", "#e1d8ad" ]
var colors_sub = [ "#00aeef", "#cf5c42", "#e1f4fd", "#f4d5e3", "#e1d8ad" ]

var clusters = {}

var layer_clusters;
var layer_links;
var layer_background;

var viz_elements;
var control_elements;

function draw_background(){
	layer_background.activate();
	
	var h = view.size.height;
	var day_pixels = 2500 / 4198; 

	for(var y = 0;  y < 12; y++){
		var x = parseInt( y * 360 * day_pixels) + 0.5;
		var p = new Path();
			p.add( [ 100 + x, 0 ]);
			p.add( [ 100 + x, h ]);
		p.strokeColor = "#dddddd";
		p.strokeWidth = 1;

		var label = new PointText( new Point( x + 20 + 100, 50) );
		label.characterStyle = {
			font: "verdana",
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

function get_clusters(){
	$.getJSON("/data/clusters", {}, function(data){
		layer_clusters.activate();

		var cluster_box_width = 0;

	    data.forEach(function(c){
			var current = {};
				current['y'] = parseInt(c["x"] * 2500);
				current['x'] = parseInt(c["y"] * 2500) + cluster_box_width + 100;
				current['w'] = Math.max( parseInt(c["w"] / 25), 20 );
				current['stream'] = c["stream_id"];

				// TODO Si quelqu'un sait calculer cette couleur sans faire le boulet. YURWELCOME.
				var b = new Path.Circle( [ current['x'], current['y'] ], current['w']);
				b.fillColor = colors_plain[ current["stream"] % colors_plain.length ];
				current['path'] = new Path.Circle( [ current['x'], current['y'] ], current['w']);
//				current['path'] = new Path.Rectangle( current['x'] - cluster_box_width/2, current['y'] - current['w'], cluster_box_width, 2 * current['w']);
				current['path'].fillColor = '#ffffff';
				current['path'].fillColor.alpha = 0.6;
				
				// current['path'].fillColor = colors_plain[ current["stream"] % colors_plain.length ];
				// current['path'].fillColor.red = current['path'].fillColor.red - 0.6;
				// current['path'].fillColor.blue = current['path'].fillColor.blue - 0.6;
				// current['path'].fillColor.green = current['path'].fillColor.green - 0.6;

				
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
				current['label_width'].content = c["w"];

				current['path'].cluster_id = c["id"];
				
			clusters[c["id"]] = current;
		});

		layer_clusters.visible = true;

		get_links();

	});
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
				p.fillColor = colors_plain[ previous["stream"] % colors_plain.length ];
				p.fillColor.alpha = 0.9;

		});

		layer_links.moveBelow(layer_clusters);
		layer_background.moveBelow(layer_links);

//		layer_clusters.scale(0.5, new Point(0, 0));
//		layer_links.scale(0.5, new Point(0, 0));

		view.draw();
	});	
}

function move_clusters(e){
    var hitResult = project.hitTest(e.point);

	if(hitResult){
		var item = hitResult.item;
		item.selected = true;
	}
}