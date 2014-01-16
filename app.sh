#!/bin/bash

APPDIR=`pwd`
DATADIR=`mktemp -d`
cd $DATADIR
mkdir -p tx addr general
python $APPDIR/node_modules/mastercoin-tools/msc_parse.py

