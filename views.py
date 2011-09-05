from flask import render_template
from pulseweb import app

@app.route('/')
def pulsehome():
	return "pika pika"

@app.route('/tubes/cluster/<cluster_id>')
def v_cluster(cluster_id):
	return tubes()

@app.route('/tubes/cluster/<cluster_id>/term/<term_id>')
def v_cluster_term(cluster_id, term_id):
	return tubes()

@app.route('/tubes/cluster/<cluster_id>/country/<country_id>')
def v_cluster_country(cluster_id, country_id):
	return tubes()

@app.route('/tubes/')
def tubes():
	return render_template("tubes.html")
	
@app.route('/metrolines/')
def metrolines():
	return render_template("metrolines.html")