from flask import render_template
from pulseweb import app

@app.route('/')
def pulsehome():
	return "pika pika"

@app.route('/food/')
def foodsecurity():
	return render_template("food_security.html")