angular.module("omniConfig")
	.constant("DefaultTranslation",{
   	"COMMON":{
   		"ACTIONS":"Actions",
		"ADDRESS":"Address",
		"AVAILABLE":"available",
		"BALANCE":"Balance",
		"BITCOIN":"Bitcoin",
   		"BROADCAST":"Broadcast Transaction",
   		"OVERVIEW":"Overview",
   		"REMOVEADDRESS":"Remove from Wallet",
		"ADDRESSES":"Addresses",
		"ASSETS":"Assets",
		"ASSET":"Asset",
		"OVERVIEW":"Overview",
   		"SEND":"Send",
   		"VALUE":"Value",
		"CREATEWALLET":"Create Wallet",
		"LOGIN":"Login",
		"LOADING":"Loading",
		"BACK":"Go back",
		"NAME":"Name",
		"SELECT":"Select",
		"SERVERERROR":"Server Error, try again later",
		"YES":"Yes",
		"NO":"No",
		"CANCEL":"Cancel",
		"CLOSE":"Close",
		"NEXT":"Next",
		"ACTIVECROWDSALES":"Active Crowdsales",
		"HISTORY":"History",
		"FEES":"Miner Fees (BTC)",
		"PASSWORD":"Password"
	},
	"HOMEPAGE":{
		"ADDRESSEXAMPLE":"(e.g. 1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P)",
   		"BALANCECHECK":"Balance Check",
   		"CHECKBALANCE":"Check Balance",
		"ENTERVALIDADDRESS":"Enter a valid Bitcoin Address ",
		"WELCOME":"Welcome to Omniwallet"
	},
	"ABOUT":{
		"CONTACT":{
			"WE":"We are a group of developers constantly working to improve Omniwallet.",  
            "QUESTIONS":"If you have any questions, issues or just want to provide some general feedback feel free to reach out to us at:",
            "GITHUBTITLE":"Github",
            "GITHUBDESC":"Search/see our 'Open Issues' and what we are 'Actively Working' on now. Don't see your specific topic? We encourage you to open a new issue to let us know. (Please include as many details as possible including ",
            "GITHUBLINK":"the output of the developer console",
            "TALKTITLE":"Knowledge Base/Support Center",
            "TALKDESC":"This is a support knowledge base where you can review common topics, post questions asking for help or help answer other users questions",
            "EMAILTITLE":"Email",
            "EMAILDESC":"You can also reach us directly at",
            "EMAILLINK":"the output of the developer console",
            "CHATTITLE":"Live Chat",
            "CHATDESC":"Chat with the developers, share your ideas or ask questions. Availability varies, but we should generally be around Mon-Fri 9-5 CDT",
            "TITLE":"Contact Us"
		},
		"MASTERCOIN":{
			"TITLE":"About Mastercoin",
			"FOUNDATION":{
				"TITLE":"Mastercoin Foundation",
				"FIRST":"In September 2013, the Mastercoin Foundation was formed to temporarily manage the funds in the Exodus Address and the distribution of the development MSC. The board of the Mastercoin Foundation has declared its intention to minimize its temporary central role by transitioning the decision making to Mastercoin owners through proof of stake voting.",
				"SECOND": "The Mastercoin Foundation advocates for the use of the Master Protocol and tries to build a community of people who develop it. All budget items, board minutes, Dev MSC vesting schedule, and bounties are public record and available to anyone on the ",
				"LINK": "Foundation's Website"
			},
			"PROTOCOL":{
				"TITLE":"Master Protocol",
				"PARAGRAPH":"The Master Protocol is a communications protocol that uses the Bitcoin block chain to enable features such as smart contracts, user currencies and decentralized peer-to-peer exchanges. A common analogy that is used to describe the relation of the Master Protocol to Bitcoin is that of HTTP to TCP/IP: HTTP, like the Master Protocol, is the application layer to the more fundamental transport and internet layer of TCP/IP, like Bitcoin. For more in-depth information and details see the ",
				"LINK":"Spec",
				"ONGITHUB":"on github."

			},
			"TOKEN":{
				"TITLE":"Mastercoins",
				"FIRST" : "Mastercoins (symbol MSC) are digital tokens that are necessary for the use of some features of the Master Protocol. The total number of Mastercoins in existence is 619,478.6 and no more MSC will ever be created. Additionally, Mastercoins can not be mined into existence. The 619,478.6 MSC were generated as a result of a public fundraiser in the style of Kickstarter.com. For more details about the algorithm by which Mastercoins were generated, please read the ",
				"HISTORY" : "History of Mastercoin",
				"ARTICLE":"article from Master Protocol Education site. "
			},
			"INFO":"Information from the ",
			"EDUCATION":"Master Protocol Education"
		},
		"OMNIWALLET":{
			"TITLE" : "About Omniwallet",
			"AIM" : "Omniwallet is a new type of web wallet which aims to combine security, usability and multi-currency support.",
			"SECURITY" : {
				"TITLE" : "Best in class security",
				"KEYS" : "Private keys are never sent to the server except in an encrypted form",
				"OPEN" : "Everything is open source from the ground up!",
				"REPLICATE" : "You can deploy the Omniwallet on your own server and host your own instance, or use one of the service providers that will host it for you - your money, your choice"
			},
			"USABILITY" : {
				"TITLE" : "Baked in usability",
				"ONLINE" : "No software to download or install, no blockchain to synchronize and verify - it just works, lightning fast",
				"PLANNED" : "Carefully planned layout, with common operations emphasized",
				"INTUITIVE" : "Beautiful and intuitive User Interface",
				"SPECIAL" : "Special care is taken to smooth out operational edge cases to prevent mistakes and ensure a painless experience for the user"
			},
			"MULTICURRENCY" : {
				"TITLE" : "Multi-currency support",
				"BUILT" : "Omniwallet comes with a pre-built support for Bitcoin, Mastercoin and Test Mastercoin",
				"SUPPORT" : "Native support for Smart Property and User-Generated Currencies",
				"ALT" : "Alt-coin support  - Omniwallet has plans to support coins that go outside of the usual Mastercoin ecosystem, such as Litecoin, Peercoin and more"
			},
			"STATUS" :{
				"TITLE" : "Current Status",
				"SPEED" : "Omniwallet is in full-speed development. Our vision and goal are well defined, and we are working hard to develop the functionality and continually improve the features",
				"INVOLVEMENT" : "We would like to get your involvement in the development effort! So go ahead and:",
				"SUGGESTIONS" : "Play around with it and give us suggestions",
				"BUGS" : "Report bugs on github",
				"CODE" : "Code up and send in pull requests that fix some of these issues",
				"CONTRIBUTIONS" : "Contributions are eligible for the",
				"BOUNTIES" : "bounties we have in place",
				"SUBMIT" : "so please be sure to submit any contribution you make to the bounty thread.",
				"BETA" : "Beta Code:",
				"MEAN" : "What does this mean? We strive to make sure the features available are working as expected, however",
				"CAUTION" : "you should still exercise caution",
				"VALUE" : "when working with anything of substantial value."
			}
		},
		"FAQ":{
			"TITLE" : "Frequently Asked Questions"
		}
	},
	"NAVIGATION":{
		"ABOUT":"About",
		"ABOUTOMNI":"About Omniwallet",
		"ABOUTMSC":"About Mastercoin",
		"ACCOUNT":"My Account",
		"ADDRESSES":"My Addresses",
		"ASSETS":"My Assets",
		"CREATE":"Create Wallet",
		"CONTACT":"Contact Us",
		"EXCHANGE":"Exchange",
		"EXPLORER":"Explorer",
		"EXPLOREASSETS":"Assets",
		"FAQ":"FAQ",
		"LOGIN":"Login",
		"LOGOUT":"Logout",
		"OFFERS":"My Offers",
		"SETTINGS":"Account Settings",
		"TRADE":"Trade",
		"TRANSACTIONS":"Transactions",
		"WALLET":"My Wallet"
	},
	"MODALS":{
		"CREATE":{
			"MESSAGES" : {
				"UUID":"This UUID is already in use",
				"CAPTCHA":"Invalid Captcha try again.",
				"VALIDATING":"We are validating your data and creating your account",
				"PASSWORDLENGTH":"Password must be at least 8 characters long",
				"PASSWORDSTRENGTH":"Password strength must be at least 70%",
				"STRENGTHTIP":"(Try having at least 2: UpperCase/LowerCase/Numbers/Symbols)",
				"PASSWORDMATCH":"Passwords do not match!",
				"EMAIL":"We will send you a welcome email containing your unique login link.",
				"EMAILVALID":"Please enter a valid email address"
			},
			"WARNING":{
				"TITLE":"Don't Forget Your Password!",
				"MESSAGE":"WARNING: Forgotten passwords are UNRECOVERABLE and can result in LOSS of ALL of your coins!"
			},
			"REQUIRED":"Required",
			"STRENGTH":"Strength",
			"REPEAT":"Repeat Password",
			"EMAIL":"Email",
			"EMAILHOLDER":"Enter an email address (optional)"
		},
		"LOGIN":{
			"ID":"Wallet ID",
			"INVALID":"Please enter a valid wallet id and password"
		}, 
		"CONFIRM":{
			"OFFLINE":"Your transaction was generated successfully, now save the text above and sign it on your Armory offline computer. Come back with the signed text to broadcast it.",
			"BROADCAST":"Broadcast",
			"CHECK":"check your transaction",
			"HERE":"here",
			"FROM":"From",
			"SIGN":"You will need to sign this transaction offline and come back to broadcast it and finish the operation."
		},
		"SEND":{
			"ERROR":"Funds could not be sent",
			"GOBACK":"Go back and change the amount",
			"CHANGED":"The value of BTC has changed, Please check the details and choose what you want to do"

		},
		"BROADCAST":{
			"TITLE":"Broadcast Signed Transaction",
			"INSTRUCTIONS":"Please copy the signed transaction on the textbox below to broadcastit",
			"ADDRESS":"Broadcasting Address",
			"SIGNED":"Signed Armory Transaction",
			"SUCCESS":"Transaction broadcasted successfully",
			"FAIL":"Transaction failed to broadcast"
		},
		"IMPORT":{
			"VALID":"Must be a valid Bitcoin address",
			"EXISTS":"Bitcoin address is already listed",
			"SUBMIT":"Add Address",
			"OFFLINE":{
				"TITLE":"Import Armory Offline Address",
				"KEY":"Enter Public Key",
				"OFFLINE":"Offline"
			},
			"WATCH":{
				"TITLE":"Import a Watch Only BTC/MSC Address",
				"ADDRESS":"Enter Address",
				"DESC":"Watch Only"
			},
			"ENCRYPTED":{
				"TITLE":"Import an Encrypted BTC/MSC Private Key",
				"KEY":"Enter Encrypted Key (Send/Receive)",
				"KEYHOLDER":"enter your encrypted private key",
				"PASSHOLDER":"enter your passphrase"
			},
			"PRIVATE":{
				"TITLE":"Import a BTC/MSC Private Key",
				"ENTER":"Enter",
				"KEY":"Private Key",
				"ENABLE":"Enable Sending",
				"KEYHOLDER":"enter your private key, formats: hex, b64, WIP, compressed WIP"
			},
			"WALLET":{
				"TITLE":"Import a Wallet Backup",
				"UPLOAD":"Upload backup file",
				"INVALID":"Must be a valid Omnicore backup file"
			}
		},
		"EXPORT":{
			"TITLE":"Export Wallet",
			"NAME":"Backup Name",
			"PASSPHRASE":"Enter Password"
		},
		"IDLE":{
			"TITLE":"Do you want to continue your session?",
			"BODY":"For security reasons your session will time out {{ idleEndTimeFormatted }} unless you continue.",
			"FOOTER":"Continue Session"
		},
		"DELETE":{
			"TITLE":"Remove from your wallet",
			"SURE":"Are you sure?",
			"DESCRIPTION":{
				"LEAD":"Removing this address from your wallet won't destroy any funds kept in it, but if this is the only place you have your private key stored, you ",
				"BOLD":"will permanently lose",
				"TRAIL":"the ability to move or cash them in!"
			
			},
			"BACKUP":{
				"LEAD":"Be VERY sure your keys are ",
				"LINK":"backed up",
				"TRAIL":"and you mean to do this!"
			
			},
			"WATCH":"Removing this WatchOnly address from your wallet only affects the displayed balances. All funds on this address will continue to remain on it and you can add it back at anytime if you wish to track them again.",
			"CONFIRM":"Yes, Remove Address"
		}
	},
	"TRANSACTION":{
		"TYPE":{
			"0":"Simple Send",
			"3":"Send To Owners",
			"20":"Sell Offer",
			"21":"DEx Phase 2",
			"22":"Accept Offer",
			"-22":"Purchase Offer",
			"50":"Create a Fixed Property",
			"51":"Create a Crowdsale",
			"-51":"Crowdsale Participation",
			"52":"Promote a Property",
			"53":"Close a Crowdsale Manually",
			"54":"Create a Managed Property",
			"55":"Grant Property Tokens",
			"56":"Revoke Property Tokens",
			"70":"Change Property Issuer on Record",
			"-1":"Unknown Transaction"
		},
		"DETAILS":{
			"0":{
				"SENDER":"You sent {{amount | toWhole:divisible }} {{coin | truncate:15}}",
				"RECIPIENT":"You received {{amount | toWhole:divisible }} {{coin | truncate:15}}"
			},
			"3":{
				"PAYER":"You sent {{amount | toWhole:divisible }} {{coin | truncate:15}}",
				"PAYEE":"You got payed {{amount | toWhole:divisible }} {{coin | truncate:15}}",
				"FEEPAYER":"You paid {{amount | toWhole:divisible }} {{coin | truncate:15}} in fees"
			},
			"20":{ 
				"SELLER":"You put {{amount | toWhole:divisible }} {{coin | truncate:15}} for sale"},
			"22":{
				"BUYER":"You reserved {{amount | toWhole:divisible }} {{coin | truncate:15}}",
				"SELLER":"{{amount | toWhole:divisible }} {{coin | truncate:15}} reserved from buyer"
			},
			"-22":{
				"BUYER":"You bought {{amount | toWhole:divisible }} {{coin | truncate:15}}",
				"SELLER":"you sold {{amount | toWhole:divisible }} {{coin | truncate:15}}"
			},
			"50":{ 
				"ISSUER":"You created {{coin | truncate:15}} with an amount of {{amount | toWhole:divisible }}"},
			"51":{ 
				"ISSUER":"You started {{coin | truncate:15}} Crowdsale"},
			"-51":{
				"ISSUER":"You got {{amount | toWhole:divisible }} {{coin | truncate:15}}",
				"PARTICIPANT":"You got {{amount | toWhole:divisible }} {{coin | truncate:15}}",
				"SENDER":"You participated with {{amount | toWhole:divisible }} {{coin | truncate:15}}",
				"RECIPIENT":"You received {{amount | toWhole:divisible }} {{coin | truncate:15}}"
			},
			"54":{ 
				"ISSUER":"You created {{coin | truncate:15}} managed property" 
			},
			"55":{
				"ISSUER":"You granted {{amount | toWhole:divisible }} {{coin | truncate:15}}",
				"RECIPIENT":"You where granted {{amount | toWhole:divisible }} {{coin | truncate:15}}"
			},
			"56":{
				"ISSUER":"You revoked {{coin | truncate:15}}"
			},
			"70":{
				"ISSUER":"{{coin | truncate:15}} ownership transfered"
			},
			"-1":{
				"SENDER":"OmiProtocol Transaction, Unknown Type"
			}
		}
	},
	"WALLET":{
		"OVERVIEW":{
			"BACKUP":"Backup",
			"ESTIMATED":"Estimated Total value",
			"IMPORT":"Import",
			"TITLE":"Overview",
			"OPTIONS":"Wallet Options",
			"OPTIONSTOGGLE":"Toggle Options",
			"PORTFOLIO":"Portfolio Composition by value",
			"WALLETID":"Wallet ID"
		},
		"ADDRESSES":{
			"CREATE":"Create New Address",
			"IMPORT":"Import Address With Private Key",
			"TITLE":"My Addresses",
			"VIEW":"View by",
			"OPTIONS":"Add Address",
			"WATCH":"Add Watch Only Address",
			"OFFLINE":"Add Armory Offline Address"
		},
		"SEND":{
			"TITLE":"Send",
			"CHOOSECOIN":"Choose coin",
			"FROM":"From address",
			"AMOUNT":"amount",
			"TO":"To address",
			"COST":"Total transaction cost",
			"PROTOCOL_COST": "Omni Protocol Transaction Cost",
			"MODAL_TRANSACTION_COST":"Transaction Cost",
			"MODAL_MINER": "Miner Fee",
			"FUNDS":"Send Funds",
			"TOKEN":"Token",
			"MODAL_AMOUNT":"Amount",
			"MODAL_FROM":"From",
			"MODAL_TO":"To",
			"CONFIRM":"Confirm Send"
		},
		"ASSETS":{
			"ASSETS":"Assets",
			"CREATE":"Create",
			"CROWDSALE":"Crowdsale",
			"MYASSETS":"My Assets",
			"SMARTPROPERTY":"Smart Property"
		},
		"HISTORY":{
			"ALLADDRESSES":"-- All Addresses --",
			"FILTERLABEL":"Omni Protocol History for",
			"TITLE":"History",
			"CURRENCY":"Currency",
			"TYPE":"Type",
			"AMOUNT":"Amount",
			"TXTIME":"Transaction time",
			"TXDETAILS":"Transaction details",
			"MOREDETAILS":"See transaction details"
		}
	},
	"ASSET":{
		"ISSUANCE":{
			"TITLE":"Create Smart Property",
			"SUBTITLE":"Issuance Details",
			"AMOUNT":"Number of Tokens",
			"AMOUNT_HINT":"Enter desired amount",
			"TYPE":"Issuance type",
			"FIXED":"Fixed",
			"MANAGED":"Managed",
			"CREATE":"Create Property",
			"MODALTITLE":"Confirm Property Creation"
		},
		"FORM":{
			"ISSUER":"Issuance Address",
			"DETAILS":{
				"SUBTITLE":"Smart Property details",
				"DIVISIBLE":"Divisible",
				"CATEGORY":"Category",
				"SUBCATEGORY":"Subcategory",
				"URL":"Property URL",
				"URL_HINT":"Enter a url for more info on the Smart Property",
				"DESCRIPTION":"Smart Property Description",
				"DESCRIPTION_HINT":"characters left",
				"NAME_HINT":"ex. Bobcoin"
			}
		},
		"CROWDSALE":{
			"TITLE":"Start a Crowdsale",
			"SUBTITLE":"Crowdsale details",
			"DEADLINE":"Deadline",
			"FORISSUER":"Percentage for issuer",
			"FORISSUER_TOOLTIP":"Additional percentage created and credited to the issuing address based on the amount created and credited for each investment. Ex:With Percentage to issuer = 10, an investment that credits 100 tokens to an investment will also credit 10 tokens to the issuer.",
			"UTC":"UTC",
			"EARLYBONUS":"Weekly early bird bonus percentage",
			"EARLYBONUS_TOOLTIP":"Bonus percentage created and credited to each investor for each week (7 days) before the deadline (calculated to the second). Ex:With Weekly early bird bonus percentage = 10, a participant investing 14 days before the deadline will get approx 20% bonus. An investor investing with 10 days left will get approx 14% bonus.",
			"EARLYESTIMATE":"Estimated initial early bird bonus",
			"EARLYESTIMATE_TOOLTIP":"Estimate based on the crowdsale creation being confirmed in the blockchain within 30 minutes after it was calculated.",
			"PER":"per",
			"INVESTED":"invested",
			"ADDCURRENCY":"+ Add investment currency",
			"TOKENRATE":"# of tokens",
			"RATES":"Rates",
			"RATE":"Rate",
			"START":"Start Crowdsale",
			"MODALTITLE":"Confirm Crowdsale Creation",
			"ACCEPTEDCURRENCY":"Accepted currency",
			"INITIALEB":"Initial early bird bonus"
		},
		"MODAL_DESCRIPTION":"Description",
		"HISTORY":{
			"TRANSACTIONS":"transactions",
			"LOADING":"Loading transactions",
			"FIXEDISSUANCE":{
				"TRUE":"Property",
				"FALSE":"Crowdsale"
			},
			"TITLE":"Asset History",
			"TRANSACTION":{
				"CLOSED":"Crowdsale was closed from further investments",
				"CREATE":"was created",
				"CONFIRMATIONS":"Confirmations", 
				"GRANT":"Granted {{amount}} tokens to {{to}}"
			}
		},
		"DETAILS":{
			"URL":"For more details visit",
			"SHARE":"Share this page"
		}
	},
	"TIMER":{
		"YEAR":"year",
		"MONTH":"month",
		"DAY":"day",
		"HOUR":"hour",
		"MINUTE":"minute",
		"SECOND":"second"
	},
	"TIMEAGO":{
		"NOW":"Just now",
		"MINUTE":"minutes ago",
		"HOUR":"hours ago",
		"DAY":"days ago",
		"WEEK":"weeks ago",
		"MONTH":"months ago",
		"YEAR":"years ago"
	},
	"CROWDSALE":{
		"DETAILS":{
			"YOUR":"Your",
			"ACTIVE":{
				"TRUE":"Active Crowdsale",
				"FALSE":"Crowdsale Closed"
			},
			"TIME":"Time Until Closing",
			"TOKENSBOUGHT":"Tokens already bought by participants",
			"TOKENSISSUER":"Tokens created for the issuer",
			"CURRENTBONUS":"Current early bird bonus",
			"GETTOKENS":"Get some tokens!",
			"PARTICIPATE":"Participate",
			"NOTOKENS":"You don't have the token accepted by this crowdsale",
			"LOGIN":"You need to login or create a wallet to participate"
		},
		"PARTICIPATION":{
			"TITLE":"Participate on {{property.name | truncate:15}} Crowdsale",
			"DESIREDCOIN":"Token to send",
			"MODAL_ESTIMATE":"Estimated amount of tokens",
			"ESTIMATE_LEAD":"You will receive",
			"ESTIMATE_TRAIL":"if you participate at this level."
		},
		"REMAINING":{
			"DAYS":"Day",
			"HOURS":"Hr",
			"MINUTES":"Min"
		},
		"PARTICIPATE":{
			"TITLE":"Confirm Participation",
			"CONFIRM":"Participate"
		}
	},
	"ECOSYSTEM":{
		"LABEL":"Ecosystem",
		"PRODUCTION":"Production",
		"TEST":"Test"
	},
	"EXPLORER":{
		"OVERVIEW":{
			"TITLE":"Latest Transactions",
			"SHORTQUERY":{
				"LEAD":"You need at least",
				"TRAIL":"more character(s) to search."
			},
			"NORESULTS":"Found 0 transactions for your query.",
			"ALPHANUMERIC":"You cannot use non-alphanumeric characters while searching.",
			"PLACEHOLDER":"Search for part of a transaction or a full transaction hash"
		},
		"INSPECTOR":{
			"TITLE":"Transaction Inspector",
			"FIELD":"Field Name",
			"DETAILS":"Details"
		}
	},
	"TABLES":{
		"TRANSACTIONS":{
			"TX":"Transaction",
			"DETAILS":"Details",
			"AMOUNT":"Amount",
			"BLOCK":"Block",
			"BLOCKTIME":"Block time (UTC)"
		},
		"ASSETS":{
			"ID":"Property ID",
			"NAME":"Property Name",
			"AMOUNT":"Total Amount",
			"URL":"Url"
		},
		"CROWDSALE":{
			"BOUGHT":"Tokens Bought",
			"CREATED":"Tokens Created"
		},
		"OFFERS":{
			"HASH":"Transaction hash",
			"PRICE":"Price per Coin",
			"AMOUNT":"Amount",
			"TOTAL":"Total Cost",
			"CANCEL":"Cancel",
			"BUY":"Buy"
		}
	},
	"EXCHANGE":{
		"TRADE":{
			"TITLE":"Trade",
			"SELL":"Sell",
			"NOCOINS":{
				"LEAD":"Sorry, you don't have any",
				"TRAIL": "available to sell"
			},
			"NOORDERS":"No offers/bids found for this timeframe",
			"ACTIVE": "Active Offers",
			"TIMEFRAME" :"Time frame",
			"TOTAL": "Total Transactions",
			"TXHASH":"Transaction hash",
			"PRICE":"Price",
			"AMOUNT":"Amount Remaining",
			"COST":"Cost",
			"FEE":"Fee",
			"PAYMENT":"Payment Window (Blocks)",
			"ENDED":"User Ended",
			"SOLD":"Sold out!",
			"BUYERFEE":"Buyer Fee",
			"ACCEPT": "Accept Offer",
			"YOURS":"Your offer/purchase"
		},
		"SALE":{
			"TITLE":"Sell Offer",
			"CHOOSECOIN":"Selected coin",
			"FROM":"From address",
			"QUANTITY":"Sell Quantity",
			"TOTAL":"Total Bitcoin desired ( # BTC for",
			"TOTALTOOLTIP":"Enter the total # of bitcoins you would want to receive if you sold all",
			"PRICE":"Price per coin",
			"TIME":"Time given to buyer to pay",
			"TIMETOOLTIP":"Time in blocks the buyer has to complete his purchase (1 block approx. 10 minutes)",
			"BUYERFEE":"Buyer's fee",
			"MODALTITLE": "Confirm Sale",
			"CURRENCY": "Selling",
			"MODAL_FROM":"From",
			"MODAL_AMOUNT": "Amount",
			"BLOCKS":"Payment Timeframe",
			"BUYERSFEE":"Buyer's Fee",
			"CONFIRM":"Confirm Sale"
		},
		"BUY":{
			"TITLE":"Accept Offer",
			"NOFUNDS":"No Funds on Addresses with private keys to complete the purchase!",
			"SENDSOME":"Send some funding to an address on the",
			"ORADD":"page or add an address with funds.",
			"ADDRESS":"Buying Address",
			"OFFERTOOLTIP":"Opens in new Window/Tab",
			"OFFER":"Sale Offer (ID / hash)",
			"SELLER":"Seller's address",
			"FEE":"Sale fee",
			"TIMEFRAME":"Payment Timeframe",
			"TIMEFRAMETOOLTIP":"If your reservation offer is accepted and validated you will have to complete the payment within this time frame.",
			"TIMEFRAMEDESCRIPTIONLEAD":" Blocks. (Approx ",
			"TIMEFRAMEDESCRIPTIONTRAIL": "hours based on an average of 10min/block)",
			"AMOUNT":"Amount to accept",
			"AMOUNTPLACEHOLDER":"For example: {{ sendPlaceholderValue }} (Max {{ global['buyOffer'].formatted_amount_available }})",
			"AMOUNTAVAILABLE":"Available to accept: {{ global['buyOffer'].formatted_amount_available }} {{ displayedAbbreviation }}",
			"AMOUNTAVAILABLEBTC":"Current Address Balance",
			"COST":"Approx Cost",
			"COSTTOOLTIP":"If your reservation offer is accepted and validated, you will have to pay this amount to complete the transaction.",
			"MODALTITLE":"Confirm Buy Offer",
			"CONFIRM":"Accept Offer",
			"CURRENCY":"Buying",
			"BLOCKS":"Blocks"
		},
		"MYOFFERS":{
			"TITLE":"My Offers",
			"BUYTITLE":"Active Buy Offers",
			"SELLTITLE":"Active Sell Offers",
			"PURCHASE":"Purchase coin",
			"EXPIRED":"Offer Expired",
			"CANCEL":"Cancel Offer",
			"PAYMENT":"Send payment",
			"COINTYPE":"Send type of coin",
			"COINMESSAGE":"To complete a pending offer, you must make purchases in Bitcoin.",
			"FROM":"Send from address",
			"TO":"Send funds to",
			"AMOUNT":"Amount to send (in",
			"REMAINING":"Blocks Remaining",
			"REMAININGTOOLTIP":"Your payment must be received within this many blocks to complete successfully",
			"BLOCKS":"blocks",
			"CANCELTITLE":"Confirm Sale Cancellation",
			"CANCELCONFIRM":"Cancel Sale",
			"CANCELMESSAGE":"You're about to cancel this sale. If this is correct, please press Cancel Sale below. "
		}
	}
})