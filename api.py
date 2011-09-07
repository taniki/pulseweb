from pulseweb import app
from pulseweb.db import query_db
from werkzeug.contrib.cache import SimpleCache
from flask import request

import time
from datetime import date

cache = SimpleCache()

import simplejson as json

# date_offset = 

@app.route('/data/streams')
def streams():
	streams = []
	
	for s in query_db('select *, count(distinct period) as period_count from clusters group by stream_id'):
		if s["period_count"] == 1 : continue

		stream = {}

		stream["id"] = s["stream_id"]	
		stream["title"] = s["cluster_label"]
		stream["clusters"] = []
		stream["links"] = []

		# there is certainly a way to speed up this part
		stream_min_max_y = query_db('SELECT min(y_pos), max(y_pos) FROM clusters, positions_metrolines_cam WHERE clusters.stream_id = %i AND clusters.cluster_univ_id = positions_metrolines_cam.cluster_univ_id GROUP BY clusters.stream_id' % (s["stream_id"]));

		if(stream_min_max_y):
			stream["min_y"] = stream_min_max_y[0]["min(y_pos)"]
			stream["max_y"] = stream_min_max_y[0]["max(y_pos)"]
			stream["height"]= stream["max_y"] - stream["min_y"] + 1

		clusters = {}

		for t in query_db('SELECT clusters.*, positions_metrolines_cam.* FROM clusters, positions_metrolines_cam WHERE clusters.stream_id = %i AND clusters.cluster_univ_id = positions_metrolines_cam.cluster_univ_id GROUP BY clusters.cluster_univ_id ORDER BY pos_y' % (s["stream_id"])):
			cluster = {}
			
			cluster["id"] = t["cluster_univ_id"]
			cluster["x"] = t["pos_x"]
			cluster["y"] = t["y_pos"] - stream["min_y"]

			clusters[cluster["id"]] = cluster
			stream["clusters"].append(cluster)

		for l in query_db('SELECT * FROM phylogeny WHERE stream_id = %i' % (s["stream_id"])):
			l_light = {}
			l_light["previous"] = l["previous_cluster_univ_id"]
			l_light["current"] = l["current_cluster_univ_id"]

			l_light["start"] = {}
			l_light["start"]["x"] = clusters[l_light["previous"]]["x"]
			l_light["start"]["y"] = clusters[l_light["previous"]]["y"]

			l_light["end"] = {}
			l_light["end"]["x"] = clusters[l_light["current"]]["x"]
			l_light["end"]["y"] = clusters[l_light["current"]]["y"]

			stream["links"].append(l_light)

		streams.append(stream)
	
	return json.dumps(streams)

@app.route('/data/tubes')
def tubes():
	return "tubes"

@app.route('/data/clusters')
def clusters():
	clusters = []

	resp = cache.get("clusters")

	if resp is None:
		for cluster in query_db('SELECT *, count(distinct period) as c FROM clusters WHERE isolated = 0 GROUP BY cluster_univ_id'):
		
			# Reduction des donnees transferees 1.4 mo -> 230 ko
			cluster_light = {}
			cluster_light["label"] = cluster["cluster_label"]
			cluster_light["id"] = cluster["cluster_univ_id"]
			cluster_light["x"] = cluster["pos_x"]
			cluster_light["x_norm"] = cluster["pos_x_t"]
			cluster_light["y"] = cluster["pos_y"]
			cluster_light["w"] = cluster["width"]
		
			t = cluster["period"].split("_")
		
			cluster_light["period_length"] = int(t[1]) - int(t[0])
			cluster_light["start"] = int(t[0])
			cluster_light["end"] = int(t[1])
			cluster_light["stream_id"] = cluster["stream_id"]

			clusters.append(cluster_light)

		resp = clusters
        cache.set('clusters', resp, timeout=5 * 60)

	return json.dumps(resp)

@app.route('/data/cluster/<int:cluster_id>')
def cluster_info(cluster_id):
	resp = []
	
	for t in query_db('SELECT * FROM clusters WHERE cluster_univ_id = %i ORDER BY weight DESC' % int(cluster_id) ):
		term = {}
		
		term["id"] = t["id0"]
		term["cluster_id"] = cluster_id
		term["label"] = t["term"]
		# term["term_id"] = t["term_id"]
		term["count_articles"] = int( t["width"] * t["weight"] )
		
		resp.append(term)
	
	return json.dumps(resp)

@app.route('/data/cluster/<int:cluster_id>/geo')
def cluster_geo(cluster_id):
	resp = []

	countries = {}
	
	for c in query_db('SELECT iso, capital_lat, capital_long FROM countries'):
		countries[ c["iso"] ] = c

	for a in query_db('SELECT * from cluster_country_weight WHERE cluster_univ_id = %i ORDER BY weight DESC' % int(cluster_id) ):
		if(a["weight"] < 2):
			continue

		countries[ a["iso"] ]["weight"] = a["weight"]

		resp.append(countries[ a["iso"] ])


	return json.dumps(resp)

@app.route('/data/cluster/<int:cluster_id>/term/<term_id>')
def cluster_term_articles(cluster_id, term_id):
	resp = []

	for t in query_db('SELECT article_id FROM cluster_term_article, terms WHERE cluster_univ_id = %i AND cluster_term_article.term_id = terms.id AND terms.term = "%s" ' % (cluster_id, term_id) ):
		resp.append(t["article_id"])

	resp = sorted ( set(resp) )

	return json.dumps(resp)

@app.route('/data/cluster/<int:cluster_id>/term/<term_id>/full')
def cluster_term_articles_full(cluster_id, term_id):
	resp = []

	a = []

	for t in query_db('SELECT article_id FROM cluster_term_article, terms WHERE cluster_univ_id = %i AND cluster_term_article.term_id = terms.id AND terms.term = "%s" ' % (cluster_id, term_id) ):
		a.append(str( t["article_id"] ) )

	a = sorted ( set(a) )

	for article in query_db('SELECT * FROM articles WHERE id IN (%s)' % (','.join(a)) ):
		resp.append(row_to_article(article));

	return json.dumps(resp)

@app.route('/data/cluster/<int:cluster_id>/country/<country_id>/full')
def cluster_country_full(cluster_id, country_id):
	resp = []
	
	# for article in query_db('SELECT articles.* from articles, region_weight, cluster_article WHERE region_weight.id = article_id AND countrycode = "%s" AND cluster_univ_id = %i AND articles.id = region_weight.id' % (country_id, cluster_id) ):
	# 	resp.append(row_to_article(article)); 
	
	t = []
	for r in query_db('SELECT id from region_weight, cluster_article WHERE region_weight.id = article_id AND countrycode = "%s" AND cluster_univ_id = %i' % (country_id, cluster_id) ):
		t.append(str( r["id"] ));

	for article in query_db('SELECT * FROM articles WHERE id IN (%s)' % (','.join(t)) ):
		resp.append(row_to_article(article));
	
	return json.dumps(resp) #json.dumps(request.headers["accept"].partition(',')[0]) #json.dumps(resp)

@app.route('/data/clusters/positions/metrolines')
def clusters_metrolines():
	clusters = []

	resp = cache.get("clusters")

	if resp is None:
		for cluster in query_db('select clusters.*, positions_metrolines_cam.* from clusters, positions_metrolines_cam WHERE clusters.cluster_univ_id =  positions_metrolines_cam.cluster_univ_id group by cluster_univ_id'):

			# Reduction des donnees transferees 1.4 mo -> 230 ko
			
			cluster_light = {}
			cluster_light["label"] = cluster["cluster_label"]
			cluster_light["id"] = cluster["cluster_univ_id"]
			cluster_light["x"] = cluster["pos_x_t"]
			cluster_light["y"] = cluster["y_pos"]
			cluster_light["w"] = cluster["width"]

			t = cluster["period"].split("_")

			cluster_light["period_length"] = int(t[1]) - int(t[0])
			cluster_light["start"] = int(t[0])
			cluster_light["end"] = int(t[1])
			cluster_light["stream_id"] = cluster["stream_id"]

			clusters.append(cluster_light)

		resp = clusters
        cache.set('clusters', resp, timeout=5 * 60)

	return json.dumps(resp)

@app.route('/data/clusters/links')
def clusters_links():
	links = []

	for l in query_db('select * from phylogeny'):
		l_light = {}
		l_light["previous"] = l["previous_cluster_univ_id"]
		l_light["current"] = l["current_cluster_univ_id"]

		links.append(l_light)

	return json.dumps(links)

@app.route("/data/meta")
def meta():
	# SELECT pos_y, SUM(width) FROM
	# (SELECT * FROM clusters GROUP BY cluster_univ_id)
	# GROUP BY pos_y
	pass

def row_to_article(r):
	o = {}
	
	o["title"] = r["title"]
	o["source"] =  r["source"]
	o["author"] =  r["author"]
	o["lang"] =  r["lang"]
	# o["date_offset"] =  date.fromtimestamp( 946681200 ).strftime("%d/%m/%Y")
	# 946681200
	# 978306360
	o["date"] =  date.fromtimestamp( 946681200 + int(r["date"]) * 86400 ).strftime("%d/%m/%Y")
	o["content"] =  r["abstract"]

	return o

@app.route("/data/article/<int:article_id>")
def get_article(article_id):
	resp = {}

	a = query_db('SELECT * FROM articles WHERE id=%i' % article_id)[0]
	
	resp = row_to_article(a)

	# 1314262254.484391
	# 9783063600
	return json.dumps(resp)

@app.route("/data/distribution/articles/by_month")
def articles_month():
	q = "select count(*) as size, strftime('%Y-%m', data) as month from publicationDate group by strftime('%Y-%m', data)"
	
	distribution = {}
	
	for m in query_db(q):
		d = m["month"].split("-")
		
#		if type(distribution[ d[0] ]) is not dict:
		if not distribution.has_key( d[0] ):
			distribution[ d[0] ] = {}
		
		distribution[ d[0] ][ d[1] ] = m["size"]

	return json.dumps(distribution)