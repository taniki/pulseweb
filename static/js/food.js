paper.install(window);

window.onload = function() {
	var canvas = document.getElementById('tubes');
	paper.setup(canvas);

    get_clusters();
}

var clusters = {}

function get_clusters(){
	$.getJSON("/data/clusters", {}, function(data){
	    data.forEach(function(c){
			var current = {};
				current['y'] = parseInt(c["x"] * 1500) - 100;
				current['x'] = parseInt(c["y"] * 800);
				current['w'] = Math.max( parseInt(c["w"] / 50), 5 );
				//current['path'] = new Path.Circle( [ current['x'], current['y'] ], current['w']);
				//current['path'].fillColor = 'black';
			
			clusters[c["id"]] = current;
		});
		view.draw();

		get_links();

	});
}

function get_links(){
	$.getJSON("/data/clusters/links", {}, function(data){
		console.log(clusters);
	    data.forEach(function(c){
				var smooth_distance = 15;
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
		view.draw();
	});	
}