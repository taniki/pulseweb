## Start the server ##

- create a __main__.py file in the folder containing the ``pulseweb`` folder

		from pulseweb import app
	
	app.DATABASE = 'PATHTO/pulseweb/db/secalim_query_secalimandco.db'
	
	if __name__ == '__main__':
		app.debug = True
		app.run()

- execute it (:

	$ python __main__.py

## Dependencies ##

- js
	- paper.js
	- jquery via google cache
- python
	- flask
	- simplejson

## WARNING ##

This repositories come without DB. You must provide a ``alimsec_africa_light.db`` file by yourself and put it in the ``db/`` directory.