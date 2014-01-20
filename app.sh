#!/bin/bash

kill_child_processes() {
	kill $SERVER_PID
}

# Ctrl-C trap. Catches INT signal
trap "kill_child_processes 1 $$; exit 0" INT

APPDIR=`pwd`
DATADIR="/tmp/msc-webwallet"

python $APPDIR/www/server.py &
SERVER_PID=$!

while true
do
	mkdir -p $DATADIR
	cd $DATADIR
	mkdir -p tx addr general
	python $APPDIR/node_modules/mastercoin-tools/msc_parse.py
	python $APPDIR/node_modules/mastercoin-tools/msc_validate.py
	
	mkdir -p $DATADIR/www/tx $DATADIR/www/addr $DATADIR/www/general
	cp --no-clobber tx/* $DATADIR/www/tx
	cp --no-clobber addr/* $DATADIR/www/addr
	cp --no-clobber general/* $DATADIR/www/general

	sleep 60
done
