var term;
var term_view;

var terms;
var terms_collection;

var article;
var article_view;

var articles;
var articles_collection;

var explorer;
var explorer_view;

$(document).ready(function(){

term = Backbone.Model.extend({
	urlRoot: "/data/term", 
	defaults: {
		id: 0,
		label: ""
	}
});

article = Backbone.Model.extend({
	urlRoot: "/data/article",
	defaults: {
		title: "title",
		content: "content",
		source: "source"
	}
});

term_view = Backbone.View.extend({
	tagName: "li",
	
	template: _.template($("#term-item").html()),
	
	initialize: function(){
		this.model.bind("change", this.render, this);
		this.model.bind("click", this.open, this);
	},
	
	render: function(){
		$(this.el).html(this.template(this.model.toJSON()));

		$(this.el).addClass("item");

		var label = this.model.get("label");
		var count = this.model.get("count_articles");

		this.$('.label').text(label);
		this.$('.count').text(count);

		return this;
	},
	
	events: {
		"click": "open" 
	},
	
	open: function(){
		explorer.load_term( this.model.get("id"), this.model.get("label") );
	}
});

article_view = Backbone.View.extend({
	tagName: "li",
	
	template: _.template($("#article-item").html()),
	
	initialize: function(){
		this.model.bind("change", this.render, this);
	},
	
	render: function(){
		$(this.el).html(this.template(this.model.toJSON()));

		$(this.el).addClass("item");

		var title = this.model.get("title");
		var source = this.model.get("source");
		var content = this.model.get("content");

		this.$('h4').text(title);
		this.$('.source').text(source);
		this.$('.body').text(content);

		return this;
	},
	
	events: {
		"click": "open" 
	},
	
	open: function(){
	}
});

terms_collection = Backbone.Collection.extend({
	model: term
});

articles_collection = Backbone.Collection.extend({
	url: "/data/articles",
	model: article
});

terms = new terms_collection;
articles = new articles_collection;

explorer_view = Backbone.View.extend({
	el: $("#explorer"),
	
	initialize: function(){
//		terms.bind("reset", this.draw_terms, this);
		terms.bind("add", this.draw_terms, this);

		articles.bind("reset", this.draw_articles, this);
	},
	
	draw_terms: function(){
		//console.log("bing");
		this.$("#current_terms").empty();
		
		terms.models.forEach(function(t){
			var v = new term_view({ model: t });
			this.$("#current_terms").append(v.render().el);
		});
		
		this.show_terms();
	},

	draw_articles: function(){
		console.log(articles);
		
		this.$("#current_articles").empty();
		
		articles.models.forEach(function(t){
			var v = new article_view({ model: t });
			this.$("#current_articles").append(v.render().el);
		});
		
		go_to_nav_step(2);
	},
	
	load_cluster: function(cluster_id){
		$.getJSON('/data/cluster/'+cluster_id, function(data){
			terms.reset();
			terms.add(data, {silent: true});
			explorer.draw_terms();
			// terms.first().trigger("click");
		});
	},

	load_term: function(cluster_id, term_id){
		$.getJSON('/data/cluster/'+cluster_id+'/term/'+term_id, function(data){
			var c = [];
			
			data.forEach(function(_article){
				var a = new article({id: _article});
				a.fetch();
				
				c.push(a);
			});

			articles.reset(c);
		});
	},
	
	show_terms: function(){
		go_to_nav_step(1);
	}
});

explorer = new explorer_view;

// explorer.load_cluster(144);

});