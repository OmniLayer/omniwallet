#!/bin/bash

APPDIR=`pwd`
DATADIR="/tmp/msc-webwallet"
mkdir -p $DATADIR
cd $DATADIR
mkdir -p tx addr general
python $APPDIR/node_modules/mastercoin-tools/msc_parse.py
python $APPDIR/node_modules/mastercoin-tools/msc_validate.py

mkdir -p $DATADIR/www/tx $DATADIR/www/addr $DATADIR/www/general
cp --no-clobber tx/* $DATADIR/www/tx
cp --no-clobber addr/* $DATADIR/www/addr
cp --no-clobber general/* $DATADIR/www/general

