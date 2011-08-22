from flask import render_template
from pulseweb import app

@app.route('/')
def pulsehome():
	return "pika pika"

@app.route('/tubes/')
def tubes():
	return render_template("tubes.html")
	
@app.route('/metrolines/')
def metrolines():
	return render_template("metrolines.html")