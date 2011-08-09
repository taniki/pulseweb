from flask import Flask

app = Flask(__name__)

import pulseweb.db
import pulseweb.api
import pulseweb.views

