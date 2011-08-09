from flask import Flask, g
from pulseweb import app

import sqlite3

# DATABASE = './db/alimsec_africa_light.db'
DATABASE = './pulseweb/db/secalim_query_secalimandco.db'

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