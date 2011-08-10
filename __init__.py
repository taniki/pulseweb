from flask import Flask

app = Flask(__name__)
app.debug = True

import pulseweb.db
import pulseweb.api
import pulseweb.views