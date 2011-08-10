paper.install(window);

window.onload = function() {
	var canvas = document.getElementById('tubes');
	paper.setup(canvas);

	layer_clusters = new Layer();
	layer_links = new Layer();
	viz_elements = new Group;

    get_clusters();

	var tool = new Tool();

	tool.onMouseDown = function(event) {
	    // move_clusters(event);
	}
}

var clusters = {}

var layer_clusters;
var layer_links;
var viz_elements;
var control_elements;

function get_clusters(){
	$.getJSON("/data/clusters", {}, function(data){
		layer_clusters.activate();

		var cluster_box_width = 0;

	    data.forEach(function(c){
			var current = {};
				current['y'] = parseInt(c["x"] * 2000) - 100;
				current['x'] = parseInt(c["y"] * 1800) + cluster_box_width + 100;
				current['w'] = Math.max( parseInt(c["w"] / 100), 8 );

				current['path'] = new Path.Circle( [ current['x'], current['y'] ], current['w']);
//				current['path'] = new Path.Rectangle( current['x'] - cluster_box_width/2, current['y'] - current['w'], cluster_box_width, 2 * current['w']);
				current['path'].fillColor = '#bbbbbb';
				
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

				current['path'].cluster_id = c["id"];
				
			clusters[c["id"]] = current;
		});

		layer_clusters.visible = true;

		get_links();

	});
}

function get_links(){
	$.getJSON("/data/clusters/links", {}, function(data){
		console.log(clusters);
		
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
				p.fillColor = '#888888';
				p.fillColor.alpha = 0.5;

		});

		layer_links.moveBelow(layer_clusters);

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