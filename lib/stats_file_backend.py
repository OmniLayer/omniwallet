import json
import threading


class StatsFileBackend(object):

    """
    This is an implementation of the Stats backend used to store the stats
    in a simple file. You can change this to an sql backend at a later date
    if needed.
    """

    def __init__(self, options={}):
        self.lock = threading.Lock()
        self.db_path = options["db_path"]

        try:
            with open(self.db_path) as db_file:
                self.stats = json.loads(db_file.read())
        except (ValueError, IOError) as e:
            self.stats = {}
            print("Could not read config, creating new one: {}".format(e))

        print("Saving stats in {}".format(self.db_path))

    def persist(self):
        with open(self.db_path, "w") as db_file:
            db_file.write(json.dumps(self.stats))

    def get(self, key):
        return self.stats.get(key, None)

    def put(self, key, val):
        with self.lock:
            self.stats[key] = val
            self.persist()
