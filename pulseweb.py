from flask import Flask, g, render_template
import sqlite3
import json

app = Flask(__name__)
##app.debug = settings.DEBUG

### DATABASE

# DATABASE = './db/alimsec_africa_light.db'
DATABASE = './db/secalim_query_secalimandco.db'

def connect_db():
    return sqlite3.connect(DATABASE)

@app.before_request
def before_request():
    g.db = connect_db()

# @app.teardown_request
# def teardown_request(exception):
#     g.db.close()

def query_db(query, args=(), one=False):
    cur = g.db.execute(query, args)
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv

### DATASETS

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

### PAGES

@app.route('/food/')
def foodsecurity():
	return render_template("food_security.html")
	
if __name__ == '__main__':
	app.debug = True
	app.run()	