RECAPTCHA_PRIVATE = None #replace private key text here
DOMAIN = None     #Replace with domain to override email domain lookup, otherwise system hostname is used
EMAILFROM = None  #Is set to None, use noreply@domain
SMTPUSER = None   #If your smtp server requires authentication define it here
SMTPPASS = None   #If your smtp server requires authentication define it here
SMTPDOMAIN = 'localhost'  #smtp server to use for sending, default    'localhost'
SMTPPORT = 25     #smtp port,  default 25

#For wallets and session store you can switch between disk and the database
LOCALDEVBYPASSDB = 0    #Set to 1 to use local storage/file system, Set to 0 to use database

#Used to generate challange/response hash
SERVER_SECRET = 'SoSecret!'
SESSION_SECRET = 'SuperSecretSessionStuff'
WEBSOCKET_SECRET = 'SocketSecret!'

#Donation Address Pubkey  (We need the pubkey so that if an address hasn't sent a tx before we don't need the private key to get the pubkey)
D_PUBKEY = '04ec31f456cc70a60793ff2033d9d2094541a5de8cac67ab1e5b1441187c6bed1601dc64c447244618268af0bd449d90d2ce71816efc69dc7921a226ed60fe926b'

