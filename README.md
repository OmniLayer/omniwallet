## Setup

update ~/.sx.cfg with an obelisk server details.  Don't have one already set up?  Here's how to build one on Rackspace: https://gist.github.com/curtislacy/8424181
```
# ~/.sx.cfg Sample file.
service = "tcp://162.243.29.201:9091"
```
Make sure you have python libraries installed.
```
sudo apt-get install python-pip
sudo pip install ecdsa
sudo pip install pycoin
```
Run npm install
```
npm install
```

## Running

Start the server by running:

```
app.sh
```

This will launch the web server, create a parsing & validation work area in /tmp/msc-webwallet, and begin parsing the blockchain using the server listed in your .sx.cfg file (see above).  By default, the server runs on port 8080.

