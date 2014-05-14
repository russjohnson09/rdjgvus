#!/home/russgvsu/.env/env/bin/python

import sys
import os

sys.path.insert(0, '/home/russgvsu/.env/env/lib/python2.6/site-packages')

os.environ['DJANGO_SETTINGS_MODULE'] = 'russgvsu.settings'

from django.core.servers.fastcgi import runfastcgi
runfastcgi(method="threaded", daemonize="false")
