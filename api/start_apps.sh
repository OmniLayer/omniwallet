#!/bin/sh

uwsgi -s 127.0.0.1:1088 -M --vhost --enable-threads --plugin python --logto /var/log/masterchain/apps.log
