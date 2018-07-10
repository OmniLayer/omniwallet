# Omniwallet: A multi-currency web wallet from Mastercoin

## What is the OmniLayer/OmniProtocol?

[Omni](http://www.omnilayer.org) is both a new type of currency (OMNI) and a platform. It is a protocol layer 
running on top of [Bitcoin](https://bitcoin.org) similar to how HTTP runs on top of TCP/IP. It provides a [decentralized currency exchange](https://www.omniwallet.org/dex/overview), user currencies, [smart property](https://www.omniexplorer.info/search/1), and other features.

For more information see the [OmniLayer website](http://www.omnilayer.org). 

## What is Omniwallet?

[Omniwallet](https://www.omniwallet.org/) is a new type of web wallet, that combines security, ease of use, multi-currency support, and is completely open source from the ground up (even including the deployment scripts)

It currently supports Bitcoin and OMNI, and all OmniProtocol created tokens.

You can access the site at [https://www.omniwallet.org](https://www.omniwallet.org/) (Note: Omniwallet is in active development, make sure you maintain proper backups of all address!)

## Ubuntu Setup
Omniwallet is currently designed to be run from a hosted environment (Like Amazon AWS). 

There are a few projects needed to set everything up. 

You'll need the Omniwallet, OmniEngine and OmniCore projects from : (https://github.com/OmniLayer)

The recommend setup /distribution requires 3 different machines. 
* Machine 1 (Frontend): Runs Omniwallet repo (frontend, api server)  (Recommend small-medium size machine at least 1.5Gb Ram + 2+gb Swap)
* Machine 2 (Backend): Runs caching system along with Omnicore and OmniEngine repos  (Recommend medium to large size machine with 2nd data drive ~300+gb for blockchain storage)
* Machine 3 (Database): Postgres database (can also be a dedicated aws rdb instance ~medium size with 10gb space right now)

All three machines should be able to talk to eachother on an internal network. 
* The frontend needs to be accessible to/from the public network,
* The backend needs to be able to talk to the public internet but doesn't need anything exposed. 
* The database only needs to be reachable on the internal network

### Automated Install

It is highly recommended to use the Automated Install method as the Manual method is currently outdated and in process of being updated

Check out the [Omni Devops Project](https://github.com/OmniLayer/omni-devops)

### Manual Install 

As Omniwallet is a growing/changing project the following is a work in progress and may not be 100% complete with current changes.


#### Database 
------------------------------
* First you need to setup and initialize a postgres database for everything to talk to. 
* The database schema and initialization files are in the `database` subfolder of OmniEngine repo. 
* There is an initialization script in the subfolder that will initialize the schema, data, and users. 
* After that the triggers and functions need to be defined/added in separetly (or added to the script). 
* Lastly import the balances.csv file into the `addressbalances` table to prime the initial balance data that is not provided by OmniCore.
 * Note: there are 2 users used for general operation. 1 user is used by frontend to read stuff from db  (variable ":omniwww") and do minimal writing. The other is the user used by omniengine to keep things updated (variable ":omniengine"). Define those names/passwords as needed and save for later. 

#### Omnicore
-------------------------------
(At the time of this writing the current version is OmniCore v0.3) 
* Omnicore is the reference client for the Omni Protocol. When it comes to transaction validity, status or outcome, it is the law.
* Updates to Omnicore must be maintained otherwise its possible for older versions to create/parse transactions incorrectly causing consensus breaking differences in implimentations. 
* Note: Omnicore is a fork/clone of Bitcoin Core with the Omnilayer logic added in . This means it will need to download the entire blockchain 100GB+ this is a slow and resource using task. Until it is fully synced it can not be used for anything. 

Recommend example config:
```
upnp=0
listen=0
rpcthreads=64
printtoconsole=1
server=1
txindex=1
checklevel=1
#rpcport=If you want to use something besides the default 8332
rpcuser= <choose an rpc username>
rpcpassword= <choose a secure password>
#Allowed to connect to local client
rpcallowip= <internal ip address of frontend machine or any machine that needs to talk to the Omnicore client directly, this line can be repeated>
```

Once that is setup / defined then go ahead and start OmniCore so it can sync the blockchain data. 

You'll want to start it as daemon or background process so it can run while you are not logged in. 

Something along the lines of this works well:   ```nohup omnicored &```

Because it is a fork of Bitcoin-core it supports all the standard config options. 

So if you need to use a separate data directory you can add the config lines: ```-conf=/path/to/bitcoin.conf/config/directory```

Once that is running let sync and get current with the blockchain. You can tail the ~/.bitcoin/debug.log  or omnicore.log   file periodically for status updates. 

Note: this process may take several days if you are starting from scratch. Alternatively if you happen to have a copy of the blockchain data from a Bitcoin-core 0.13 client you can copy it over and use it (future versions 0.14 may not work)

#### Caching System
-------------------------------
Machine 2 is designed to leverage a default install of redis-server for caching. 
should be as simple as 'apt-get install redis-server'


#### OmniEngine
-------------------------------
The Omniwallet parsing engine that does the second half of backend work (taking transaction data from Omnicore and putting it in the database for Omniwallet to use)

Clone [OmniEngine](https://github.com/OmniLayer/omniEngine) to machine 2. 

Uses python 2.7 and pip so you'll need to make sure its installed. 

Then use the requirements.txt file from the repo to install the additional dependancies needed. 

NOTE: The OmniEngine processes CAN NOT and SHOULD NOT be started until Omnicore is 100% synced, current and up to date


#### Frontend
-------------------------------
Important Notes:
* The frontend pulls all its information from the database and the redis cache. 
* This means that it can not be started until OmniEngine has processed/parsed all the data from Omnicore

~~Install dependencies:
```
sudo apt-get update
sudo apt-get install git build-essential autoconf libtool libboost-all-dev pkg-config libcurl4-openssl-dev libleveldb-dev libzmq-dev libconfig++-dev libncurses5-dev python-simplejson python-git libffi-dev libpq-dev uwsgi uwsgi-plugin-python
```
For Armory offline addresses build and install Armory packages
```
sudo apt-get install git-core build-essential pyqt4-dev-tools swig libqtcore4 libqt4-dev python-qt4 python-dev python-twisted python-psutil
git clone https://github.com/goatpig/BitcoinArmory.git
check any dependancies for BitcoinArmory then
cd BitcoinArmory
sudo make
sudo make install
```
Install Python-pip
```
cd
sudo apt-get remove python-pip
wget https://bootstrap.pypa.io/get-pip.py
sudo python get-pip.py
```
Clone Omni repository:
```
cd
git clone https://github.com/OmniLayer/omniwallet
```
Install nginx:
```
cd omniwallet
sudo -s
pip install -r requirements.txt
nginx=stable # use nginx=development for latest development version
add-apt-repository ppa:nginx/$nginx
apt-get update
apt-get install nginx
cp etc/nginx/sites-available/default /etc/nginx/sites-available
```
Find and replace the following sections near the beginning of /etc/nginx/sites-available/default:
```
nano /etc/nginx/sites-available/default

        ## Set this to reflect the location of the www directory within the omniwallet repo.
        root /home/myUser/omniwallet/www/; -> "root /{path to project}/omniwallet/www/;

        ## Set this to reflect the location of the omni-redirects file within the omniwallet repo
        include /home/myUser/omniwallet/etc/nginx/sites-available/omni-redirects;

```
Install nodejs/npm and dependancies:
```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g uglify-js
sudo npm install -g grunt-cli
sudo chmod -R 777 ~/.npm
npm install grunt
npm install bower
npm install
```
*Note*: You need to populate $HOME/.bitcoin/bitcoin.conf with rpcssl, rpcuser, rpcpassword, and rpcport, example config:
```
server=1
rpcport=8332
rpcuser=user
rpcpassword=pass
rpcssl=0
rpcconnect=<remote.ip.address>
```

*Note*: You need to populate the $HOME/.omni/sql.conf with the database configuration information for the API user:
```
sqluser=
sqlport=
sqlconnect=
sqldatabase=
#sqlpassword=
sqlpassword=
```

## Running

Start nginx by running the command for your distribution.
on Ubuntu use:
```
sudo service nginx start
```

Using the config included, nginx will launch an HTTP server on port 80.

Update the api/config.py file for your setup. 
Start the python api services by running:

```
app.sh
```

It is recommend to run the api service in a screen or other automated service that does not exit / close when session is termindated
```
screen -S omni
cd /{path to project}/omniwallet
./app.sh
```
Hit CTRL+a+d to exit the screen while keeping it active, and use the command ``screen -S omni``.

## Development Contributions, Signing with your PGP key

Signing your commits with a PGP key is always appreciated.
1. Generate a key: http://stackoverflow.com/a/16725717/364485
2. Sign your commit: ``git commit -S`` (Works for merges too, don't need to sign every commit, just the last one before you push something up.
3. Check the signature on your commit: https://github.com/mastercoin-MSC/omniwallet/commit/d05dd949acb7234843d0e32b50c12a3556b8444b

## API
See the [API Documentation](https://api.omniwallet.org)
