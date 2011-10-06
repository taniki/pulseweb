var metroline;
var metrolines;

var metrolines_collection;
var metroline_view;
var metrolines_nav;

var nav_step	= 0;
var nav_width	= [0, 236, 236*3 -6 ];

var switch_viz_mode = 1;

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
//	url: '/data/streams',
	url: '/data/streams',
	model: metroline,
});

metrolines = new metrolines_collection;

metrolines_nav = Backbone.View.extend({
	el: $("nav"),
	
	initialize: function(){
		metrolines.bind("reset", this.reset, this);
		
		metrolines.fetch();
	},
	
	reset: function(l){		
		this.$("#available").empty();
		
		metrolines.models.forEach(function(m){
			var v = new metroline_view({ model: m });
			this.$("#available").append(v.render().el);
		});
		
		metrolines.trigger("loaded");
	},
	
	select: function(stream_id, move){
		
		if(typeof move === "undefined"){ var move = true; }
		
		$("nav div div").removeClass("selected");
		$("nav .stream_"+stream_id).addClass("selected");
		
		if(move){ $("nav").scrollTo($("nav .stream_"+stream_id)); }
	}	
});

app_routes = Backbone.Router.extend({
	routes: {
		"": 											"home",
		"cluster/:cluster_id":							"focus_cluster",
		"cluster/:cluster_id/term/:term_id":			"focus_cluster_term",

		"map":											"map",
		"cluster/:cluster_id":							"focus_cluster",
		"cluster/:cluster_id/term/:term_id":			"focus_cluster_term",
		"cluster/:cluster_id/country/:country_id":		"focus_cluster_country"

	},
	
	home: function(){
		pan_to_cluster(clusters[161]);
	},
	
	map: function(){
		switch_viz();
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
	},
	
	focus_cluster_country: function(cluster_id, country_id){
		
	}
	});

window.sidenav = new metrolines_nav;

$(".container").height($(".container").height() - 24 +"px");
$("#current_filter").children("ul").height( ($(".container").height()) * 2 +"px");

$("#current_filter").children("ul").children("ul").height( $("#current_filter > ul").height()/2 +"px");


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

metrolines.bind("loaded", function(){
	nav_is_ready = true;
	
	if(viz_is_ready){
		Backbone.history.start({pushState: true, root: "/tubes/"});
	}
	
	metrolines.unbind("loaded");
});

$(document).keypress(function(e){
	if(e.which == 109){
		switch_viz();
	}
});

$(".switch_viz").click(function(){
	switch_viz();
});

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

	$("#map").animate({
		left: - parseInt(nav_width[step]/2)
	}, "slow");
}

function switch_viz(){
	console.log("zip");

	$(".viz").animate({
		top: - switch_viz_mode * $("#big_viz").attr("height")
	}, "fast");
	
	$("#current_filter>ul").animate({
		top: - switch_viz_mode * $("#current_filter > ul").height()/2
	}, "fast");
	
	$("#viz .ui .slider div").animate({
		left: switch_viz_mode * 32
	}, "fast");
	
	if(switch_viz_mode == 1 ){ switch_viz_mode = 0; }
	else if(switch_viz_mode == 0 ){ switch_viz_mode = 1; }
}