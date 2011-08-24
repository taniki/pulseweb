var metroline;
var metrolines;

var metrolines_collection;
var metroline_view;
var metrolines_nav;

var nav_step	= 0;
var nav_width	= [ 236, 466 ];

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
		$("nav").scrollTop($("nav .stream_"+stream_id).position().top);
	}
});

window.sidenav = new metrolines_nav;

$(".container").height($(".container").height() - 18 +"px");

$(".more").click(function(){
	if(nav_step < nav_width.length){
		var offset = nav_width[nav_step];

		$("#main").animate({
			right: "+="+offset
		}, "slow",
		function(){
			$("#main .ui").animate({
				left: "+="+offset
			}, "slow");
		});
	
		nav_step += 1;
	}
});

$(".less").click(function(){
	if(nav_step >= 0){
		nav_step -= 1;
		var offset = nav_width[nav_step];

		$("#main").animate({
			right: "-="+offset
		}, "slow",
		function(){
			$("#main .ui").animate({
				left: "-="+offset
			}, "slow");
		});
	}
});

});

