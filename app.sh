DATADIR="/var/lib/omniwallet"

if [ "$1" = "-status" ]; then
  cat $DATADIR/www/revision.json | cut -d"," -f3
  cat $DATADIR/www/revision.json | cut -d"," -f4
  exit
fi

#!/bin/bash
PYTHONBIN=python

kill_child_processes() {
  kill $SERVER_PID
  rm -f $LOCK_FILE
}

# Ctrl-C trap. Catches INT signal
trap "kill_child_processes 1 $$; exit 0" INT
echo "Starting app.sh: $(TZ='UTC' date)"

echo "Establishing environment variables..."
APPDIR=`pwd`
TOOLSDIR=$APPDIR/node_modules/mastercoin-tools
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

echo "Beginning main run loop..."
while true
do

  # check lock (not to run multiple times)
  if [ ! -f $LOCK_FILE ]; then

    # lock
    touch $LOCK_FILE

    ps cax | grep uwsgi > /dev/null
    if [ $? -eq 0 ]; then
	echo "uwsgi api is running."
    else
	echo "Starting uwsgi daemon..."
	cd $APPDIR/api
	if [[ "$OSTYPE" == "darwin"* ]]; then
	  uwsgi -s 127.0.0.1:1088 -p 8 -M --vhost --enable-threads --logto $DATADIR/apps.log &
	else
	  uwsgi -s 127.0.0.1:1088 -p 8 -M --vhost --enable-threads --plugin $PYTHONBIN --logto $DATADIR/apps.log &
	fi
	SERVER_PID=$!
    fi

    mkdir -p $DATADIR
    cd $DATADIR
    mkdir -p properties tmptx tx addr general offers wallets sessions mastercoin_verify/addresses mastercoin_verify/transactions www

    # parse until full success
    x=1 # assume failure
    # echo -n > $PARSE_LOG #Do not overwrite
    while [ "$x" != "0" ];
    do
      echo "Parsing...$(cat www/revision.json | cut -d"," -f3),$(cat www/revision.json | cut -d"," -f4), time now is $(TZ='UTC' date)" | tee -a $PARSE_LOG
      $PYTHONBIN $TOOLSDIR/msc_parse.py -r $TOOLSDIR 2>&1 >> $PARSE_LOG
      x=$?
    done
    echo "Running validation step..."
    $PYTHONBIN $TOOLSDIR/msc_validate.py 2>&1 > $VALIDATE_LOG

    echo "Getting price calculation..."
    mkdir -p $DATADIR/www/values $DATADIR/www/values/history
    $PYTHONBIN $APPDIR/api/coin_values.py

    # update archive
    echo "Running archive tool..."
    $PYTHONBIN $TOOLSDIR/msc_archive.py -r $TOOLSDIR 2>&1 > $ARCHIVE_LOG

    mkdir -p $DATADIR/www/tx $DATADIR/www/addr $DATADIR/www/general $DATADIR/www/offers $DATADIR/www/properties $DATADIR/www/mastercoin_verify/addresses $DATADIR/www/mastercoin_verify/transactions

    echo "Copying data back to /www/ folder..."
    find $DATADIR/tx/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/tx
    find $DATADIR/addr/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/addr
    find $DATADIR/general/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/general
    find $DATADIR/offers/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/offers
    find $DATADIR/properties/. -name "*.json" | xargs -I % cp -rp % $DATADIR/www/properties
    find $DATADIR/mastercoin_verify/addresses/. | xargs -I % cp -rp % $DATADIR/www/mastercoin_verify/addresses
    find $DATADIR/mastercoin_verify/transactions/. | xargs -I % cp -rp % $DATADIR/www/mastercoin_verify/transactions

   echo "Updating Stats/Status File"
   $PYTHONBIN $APPDIR/api/stats.py
   $PYTHONBIN $APPDIR/api/status.py -o $APPDIR -d $DATADIR

    # unlock
    rm -f $LOCK_FILE
  fi

  echo "Done, sleeping..."
  # Wait a minute, and do it all again.
  sleep 60
done
