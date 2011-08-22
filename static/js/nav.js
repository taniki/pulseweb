var metroline;
var metrolines;

var metrolines_collection;
var metroline_view;
var metrolines_nav;


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

		var title = this.model.get('title');
		draw_metroline_single(this.$("canvas"), this.model);

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
		console.log(metrolines);
	},
	
	reset: function(l){		
		this.$("#available").empty();
		
		metrolines.models.forEach(function(m){
			var v = new metroline_view({ model: m });
			this.$("#available").append(v.render().el);
		});
	}
});

window.sidenav = new metrolines_nav;

});

