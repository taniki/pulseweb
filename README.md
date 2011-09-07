# Pulseweb

Pulseweb is a small project. It is packaged as a webserver with it's API and the corresponding views. It's main use is data visualization (symbolic and geographic).

## Routes ##

- views
	- /tubes/
	- /tubes/cluster/:id
	- /tubes/cluster/:id/term/:id
- API
	- /data/streams
	- /data/clusters
	- /data/clusters/links
	- /data/cluster/:id
	- /data/cluster/:id/geo
	- /data/cluster/:id/term/:id
	- /data/cluster/:id/term/:id/full
	- /data/cluster/:id/country/:id/full
	- /data/article/:id
	- /data/distribution/articles/by_month

All the API responses are in JSON.

## Dependencies ##

- js (already bundled and minimized in the repo)
	- [jquery](jquery.com)
	- [underscore](http://underscorejs.org)
	- [paper.js](http://paperjs.org/)
	- [backbone](http://backbonejs.org)
	- [polymaps](http://polymaps.org)
- python
	- flask
	- simplejson

## TO DO ##

- add non-json view (condition on ``if(request.accept)``)
- add unit tests
- add performance tests
- refactorize the js
- integrate with requirejs

## WARNING ##

This repositories come without DB. You must provide a ``alimsec_africa_light.db`` file by yourself and put it in the ``db/`` directory.

## Start the server ##

- create a ``__main__.py`` file in the folder containing the ``pulseweb`` folder

```python
from pulseweb import app

app.DATABASE = 'PATHTO/pulseweb/db/secalim_query_secalimandco.db'

if __name__ == '__main__':
	app.debug = True
	app.run()
```

- execute it (:

```shell
$ python __main__.py
```
