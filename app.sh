#!/bin/bash

kill_child_processes() {
	kill $SERVER_PID
	rm -f $LOCK_FILE
}

# Ctrl-C trap. Catches INT signal
trap "kill_child_processes 1 $$; exit 0" INT

APPDIR=`pwd`
TOOLSDIR=$APPDIR/node_modules/mastercoin-tools
DATADIR="/var/lib/omniwallet"
LOCK_FILE=$DATADIR/msc_cron.lock
PARSE_LOG=$DATADIR/parsed.log
VALIDATE_LOG=$DATADIR/validated.log
ARCHIVE_LOG=$DATADIR/archived.log

if [ ! -d $DATADIR/tx ]; then
	cp -r $TOOLSDIR/www/tx $DATADIR/tx
fi

# Export directories for API scripts to use
export TOOLSDIR
export DATADIR
cd $APPDIR/api
uwsgi -s 127.0.0.1:1088 -p 8 -M --vhost --enable-threads --plugin python --logto $DATADIR/apps.log &
SERVER_PID=$!

while true
do

	# check lock (not to run multiple times)
	if [ ! -f $LOCK_FILE ]; then

		# lock
		touch $LOCK_FILE

		mkdir -p $DATADIR
		cd $DATADIR
		mkdir -p tmptx tx addr general offers wallets sessions mastercoin_verify/addresses mastercoin_verify/transactions www

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
	
		mkdir -p $DATADIR/www/tx $DATADIR/www/addr $DATADIR/www/general $DATADIR/www/offers $DATADIR/www/mastercoin_verify/addresses $DATADIR/www/mastercoin_verify/transactions

    find $DATADIR/tx/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/tx
    find $DATADIR/addr/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/addr
    find $DATADIR/general/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/general
    find $DATADIR/offers/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/offers
    find $DATADIR/mastercoin_verify/addresses/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/mastercoin_verify/addresses
    find $DATADIR/mastercoin_verify/transactions/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/mastercoin_verify/transactions
	
		# unlock
		rm -f $LOCK_FILE
	fi

	# Wait a minute, and do it all again.
	sleep 60
done
