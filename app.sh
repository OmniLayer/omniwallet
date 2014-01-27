#!/bin/bash

kill_child_processes() {
	kill $SERVER_PID
	rm -f $LOCK_FILE
}

# Ctrl-C trap. Catches INT signal
trap "kill_child_processes 1 $$; exit 0" INT

APPDIR=`pwd`
TOOLSDIR=$APPDIR/node_modules/mastercoin-tools
DATADIR="/tmp/msc-webwallet"
LOCK_FILE=$DATADIR/msc_cron.lock
PARSE_LOG=$DATADIR/parsed.log
VALIDATE_LOG=$DATADIR/validated.log
ARCHIVE_LOG=$DATADIR/archived.log

if [ ! -d $DATADIR ]; then
	mkdir -p $DATADIR
	cp -r $TOOLSDIR/www/tx-bootstrap $DATADIR/tx
fi

cd $TOOLSDIR/apps
uwsgi -s 127.0.0.1:1088 -M --vhost --enable-threads --plugin python --logto $DATADIR/apps.log &
SERVER_PID=$!

while true
do

	# check lock (not to run multiple times)
	if [ ! -f $LOCK_FILE ]; then

		# lock
		touch $LOCK_FILE

		mkdir -p $DATADIR
		cd $DATADIR
		mkdir -p tx addr general bids mastercoin_verify/addresses mastercoin_verify/transactions www

		# parse until full success
		x=1 # assume failure
		echo -n > $PARSE_LOG
		while [ "$x" != "0" ];
		do
			python $TOOLSDIR/msc_parse.py -r $TOOLSDIR 2>&1 >> $PARSE_LOG
  			x=$?
		done

		python $TOOLSDIR/msc_validate.py 2>&1 > $VALIDATE_LOG
	
		# update archive
		python $TOOLSDIR/msc_archive.py -r $TOOLSDIR 2>&1 > $ARCHIVE_LOG
	
		mkdir -p $DATADIR/www/tx $DATADIR/www/addr $DATADIR/www/general $DATADIR/www/bids $DATADIR/www/mastercoin_verify/addresses $DATADIR/www/mastercoin_verify/transactions
		cp --no-clobber tx/* $DATADIR/www/tx
		cp --no-clobber addr/* $DATADIR/www/addr
		cp --no-clobber general/* $DATADIR/www/general
		cp --no-clobber bids/* $DATADIR/www/bids
		cp --no-clobber mastercoin_verify/addresses/* $DATADIR/www/mastercoin_verify/addresses
		cp --no-clobber mastercoin_verify/transactions/* $DATADIR/www/mastercoin_verify/transactions
	
		# unlock
		rm -f $LOCK_FILE
	fi

	# Wait a minute, and do it all again.
	sleep 60
done
