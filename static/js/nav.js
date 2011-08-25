var metroline;
var metrolines;

var metrolines_collection;
var metroline_view;
var metrolines_nav;

var nav_step	= 0;
var nav_width	= [0, 236, 236*3 -6 ];

var nav_is_ready = false;

var router;
var app_routes;

$(document).ready(function(){

metroline = Backbone.Model.extend({
	urlRoot: "/data/metroline",

	defaults: {
		id: 0,
		title: "lorem ipsum",
		x: 0,
		y: 0,
		canvas: null
	},
	
	initialize: function(){
		// console.log("loading stream: "+ this.id);
	}
});

metroline_view = Backbone.View.extend({
	tagName: "div",

	template: _.template($("#metroline-item").html()),

	initialize: function() {
		this.model.bind('change', this.render, this);
    },

	render: function() {
		$(this.el).html(this.template(this.model.toJSON()));


		$(this.el).addClass("item");
		$(this.el).addClass("stream_"+this.model.get("id"));
		var title = "stream "+this.model.get("id")+": "+this.model.get("title");
		init_metroline_single(this.$("canvas")[0], this.model);

		this.$('h3').text(title);

		return this;
	}
});

metrolines_collection = Backbone.Collection.extend({
	url: '/data/streams',
	model: metroline,
});

metrolines = new metrolines_collection;

metrolines_nav = Backbone.View.extend({
	el: $("nav"),
	
	initialize: function(){
		metrolines.bind("reset", this.reset, this);
		
		metrolines.fetch();
		
		nav_is_ready = true;
	},
	
	reset: function(l){		
		this.$("#available").empty();
		
		metrolines.models.forEach(function(m){
			var v = new metroline_view({ model: m });
			this.$("#available").append(v.render().el);
		});
	},
	
	select: function(stream_id){
		$("nav div div").removeClass("selected");
		$("nav .stream_"+stream_id).addClass("selected");
		
		// FIXME provoking a bug when the nav is not yet loaded. ex: routing
		if($("nav .stream_"+stream_id).position()){
			$("nav").scrollTop($("nav .stream_"+stream_id).position().top);
		}
	}	
});

app_routes = Backbone.Router.extend({
	routes: {
		"": 											"home",
		"cluster/:cluster_id":							"focus_cluster",
		"cluster/:cluster_id/term/:term_id":			"focus_cluster_term"
	},
	
	home: function(){
		pan_to_cluster(clusters[158]);
	},
	
	focus_cluster: function(cluster_id, silent){
//		console.log("route : cluster/:cluster_id param:"+ cluster_id);
		var c = clusters[cluster_id];
		
		select_cluster(c);
		pan_to_cluster(c);
		sidenav.select(c["stream"]);
		explorer.load_cluster(c["id"], silent);
	},
	
	focus_cluster_term: function(cluster_id, term_id){
//		console.log("route : cluster/:cluster_id param:"+ cluster_id);
		this.focus_cluster(cluster_id, true);
		explorer.load_term(cluster_id, term_id)
	}
});

window.sidenav = new metrolines_nav;

$(".container").height($(".container").height() - 24 +"px");

$(".more").click(function(){
	if(nav_step > 0){
		go_to_nav_step(nav_step-1);
	}
});

$(".less").click(function(){
	if(nav_step < nav_width.length){
		go_to_nav_step(nav_step+1);
	}
});

router = new app_routes();

});

function go_to_nav_step(step){
	nav_step = step;
	
	var pos = -702 + nav_width[step];
	
	$("#main").animate({
		right: pos
	}, "slow",
	function(){
		$("#main .ui").animate({
			left: nav_width[step] - 32 + 236
		}, "slow");
	});
	$("#big_viz canvas").animate({
		left: - parseInt(nav_width[step]/2)
	}, "slow");

}
