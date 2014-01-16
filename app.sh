#!/bin/bash

APPDIR=`pwd`
DATADIR="/tmp/msc-webwallet"
mkdir -p $DATADIR
cd $DATADIR
mkdir -p tx addr general
python $APPDIR/node_modules/mastercoin-tools/msc_parse.py

