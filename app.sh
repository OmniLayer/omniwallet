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
  kill $WEBSOCKET_PID
  rm -f $LOCK_FILE
}

# Ctrl-C trap. Catches INT signal
trap "kill_child_processes 1 $$; exit 0" INT
echo "Starting app.sh: $(TZ='UTC' date)"

echo "Establishing environment variables..."
APPDIR=`pwd`
TOOLSDIR=$APPDIR/node_modules/mastercoin-tools
LOCK_FILE=$DATADIR/msc_cron.lock

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

    #Update debug level
    if [ -e "$DATADIR/debug.level" ]; then
        DEBUGLEVEL=`cat $DATADIR/debug.level`
    else
        DEBUGLEVEL=0
    fi
    export DEBUGLEVEL

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
        echo $SERVER_PID > /tmp/omniapp.pid
        #get snapshot of directory files
        APISHA=`ls -lR $APPDIR/api/*.py | sha1sum`
    fi

    #check if api files have changed
    CHECKSHA=`ls -lR $APPDIR/api/*.py | sha1sum`
    #Trigger api reload if changed
    if [ "$APISHA" != "$CHECKSHA" ]; then
        uwsgi --reload /tmp/omniapp.pid
        APISHA=$CHECKSHA
        echo Api Reloaded
    fi

    ps a | grep -v grep | grep "python websocket.py" > /dev/null
    if [ $? -eq 0 ]; then
        echo "websocket api is running."
      else
        echo "Starting websocket daemon..."
        cd $APPDIR/api
        $PYTHONBIN websocket.py > $DATADIR/websocket.log 2>&1 &
        WEBSOCKET_PID=$!
    fi

    mkdir -p $DATADIR
    cd $DATADIR
    mkdir -p wallets sessions www

    #echo "Updating Stats/Status File"
    #$PYTHONBIN $APPDIR/api/stats.py
    #$PYTHONBIN $APPDIR/api/status.py -o $APPDIR -d $DATADIR

    # unlock
    rm -f $LOCK_FILE
  fi

  echo "Done, sleeping..."
  # Wait a minute, and do it all again.
  sleep 60
done
