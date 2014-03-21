import platform
from stats_file_backend import StatsFileBackend


class StatsBackend(object):

    """
    This is a class to manage the Stats backend.
    """

    def __init__(self, options={}):
        if options == {}:
            if platform.system() == "Darwin":  # For my local dev I need this hack
                options = {"db_path": "/tmp/stats.json"}
            else:
                options = {"db_path": "/var/lib/omniwallet/www/stats.json"}
        self.engine = StatsFileBackend(options)

    def put(self, key, val):
        self.engine.put(key, val)

    def increment(self, key):
        val = self.engine.get(key)

        if val is None:
            val = 0

        val += 1
        self.engine.put(key, val)

    def get(self, val):
        return self.engine.get(val)
