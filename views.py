from flask import render_template
from pulseweb import app

@app.route('/')
def pulsehome():
	return "pika pika"

@app.route('/tubes/')
@app.route('/tubes/cluster/<cluster_id>')
@app.route('/tubes/cluster/<cluster_id>/term/<term_id>')
@app.route('/tubes/cluster/<cluster_id>/country/<country_id>')
def tubes(cluster_id = None, term_id = None, country_id = None):
	return render_template("tubes.html")
	
@app.route('/metrolines/')
def metrolines():
	return render_template("metrolines.html")