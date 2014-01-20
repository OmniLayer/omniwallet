#!/bin/sh
cd html_includes

FILE=../www/index.html
TITLE="Masterchain"
SCRIPT1="masterEvents.js"
cat	head_begin.inc > $FILE
echo "         $TITLE" >> $FILE
cat	head_middle.inc >> $FILE
echo "      <script src=\"$SCRIPT1\"></script>" >> $FILE
cat	head_end.inc \
	body_first.inc \
	body_nav.inc \
	body_recent.inc \
	body_paginator.inc \
	body_post_paginator.inc \
	body_last.inc >> $FILE

FILE=../www/Address.html
TITLE="Address information"
SCRIPT1="js/jquery.qrcode.min.js"
SCRIPT2=""js/bootstrap.min.js""
SCRIPT3="address.js"
SCRIPT4="wallet.js"
cat	head_begin.inc > $FILE
echo "         $TITLE" >> $FILE
cat	head_middle.inc >> $FILE
echo "      <script src=\"$SCRIPT1\"></script>" >> $FILE
echo "      <script src=\"$SCRIPT2\"></script>" >> $FILE
echo "      <script src=\"$SCRIPT3\"></script>" >> $FILE
echo "      <script src=\"$SCRIPT4\"></script>" >> $FILE
cat	head_end.inc \
	body_first.inc \
	body_nav.inc \
	body_address.inc \
	body_last.inc >> $FILE

FILE=../www/simplesend.html
TITLE="Simple Send"
SCRIPT1="simplesend.js"
cat	head_begin.inc > $FILE
echo "         $TITLE" >> $FILE
cat	head_middle.inc >> $FILE
echo "      <script src=\"$SCRIPT1\"></script>" >> $FILE
cat	head_end.inc \
	body_tx_first.inc \
	body_nav.inc \
	body_simplesend.inc \
	body_last.inc >> $FILE

