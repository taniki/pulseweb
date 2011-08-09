from pulseweb import app
from pulseweb.db import query_db
import json

@app.route('/data/tubes')
def tubes():
	return "tubes"

@app.route('/data/clusters')
def clusters():
	clusters = []

	for cluster in query_db('select * from clusters group by cluster_univ_id'):
		
		# Reduction des donnees transferees 1.4 mo -> 230 ko
		cluster_light = {}
		cluster_light["label"] = cluster["cluster_label"]
		cluster_light["id"] = cluster["cluster_univ_id"]
		cluster_light["x"] = cluster["pos_x"]
		cluster_light["y"] = cluster["pos_y"]
		cluster_light["w"] = cluster["width"]

		clusters.append(cluster_light)

	return json.dumps(clusters)

@app.route('/data/clusters/links')
def clusters_links():
	links = []

	for l in query_db('select * from phylogeny'):
		l_light = {}
		l_light["previous"] = l["previous_cluster_univ_id"]
		l_light["current"] = l["current_cluster_univ_id"]

		links.append(l_light)

	return json.dumps(links)