from flask import Flask
from flaskext.markdown import Markdown

app = Flask(__name__)
Markdown(app)
app.debug = True

import pulseweb.db
import pulseweb.api
import pulseweb.views