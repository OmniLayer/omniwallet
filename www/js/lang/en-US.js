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
		"YES":"Yes",
		"NO":"No",
		"CANCEL":"Cancel",
		"NEXT":"Next",
		"ACTIVECROWDSALES":"Active Crowdsales",
		"HISTORY":"History",
		"FEES":"Miner Fees (BTC)"
	},
	"HOMEPAGE":{
		"ADDRESSEXAMPLE":"e.g.",
   		"BALANCECHECK":"Balance Check",
   		"CHECKBALANCE":"Check Balance",
		"ENTERVALIDADDRESS":"Enter a valid Bitcoin Address ",
		"WELCOME":"Welcome to Omniwallet"
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
			"70":"Change Property Issuer on Record"
		},
		"DETAILS":{
			"0":{
				"SENDER":"You sent {{amount | toWhole:divisible }} {{coin}}",
				"RECIPIENT":"You recieved {{amount | toWhole:divisible }} {{coin}}"
			},
			"3":{
				"PAYER":"You sent {{amount | toWhole:divisible }} {{coin}}",
				"PAYEE":"You got payed {{amount | toWhole:divisible }} {{coin}}",
				"FEEPAYER":"You paid {{amount | toWhole:divisible }} {{coin}} in fees"
			},
			"20":{ 
				"SELLER":"You put {{amount | toWhole:divisible }} {{coin}} for sale"},
			"22":{
				"BUYER":"You reserved {{amount | toWhole:divisible }} {{coin}}",
				"SELLER":"{{amount | toWhole:divisible }} {{coin}} reserved from buyer"
			},
			"-22":{
				"BUYER":"You bought {{amount | toWhole:divisible }} {{coin}}",
				"SELLER":"you sold {{amount | toWhole:divisible }} {{coin}}"
			},
			"50":{ 
				"ISSUER":"You created {{coin}} with an amount of {{amount | toWhole:divisible }}"},
			"51":{ 
				"ISSUER":"You started {{coin}} Crowdsale"},
			"-51":{
				"ISSUER":"You got {{amount | toWhole:divisible }} {{coin}}",
				"PARTICIPANT":"You got {{amount | toWhole:divisible }} {{coin}}",
				"SENDER":"You participated with {{amount | toWhole:divisible }} {{coin}}",
				"RECIPIENT":"You recieved {{amount | toWhole:divisible }} {{coin}}"
			},
			"54":{ 
				"ISSUER":"You created {{coin}} managed property" 
			},
			"55":{
				"ISSUER":"You granted {{amount | toWhole:divisible }} {{coin}}",
				"RECIPIENT":"You where granted {{amount | toWhole:divisible }} {{coin}}"
			},
			"56":{
				"ISSUER":"You revoked {{coin}}"
			},
			"70":{
				"ISSUER":"{{coin}} ownership transfered"
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
			"FILTERLABEL":"Full Wallet History for",
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
			"TRANSACTION":{
				"CLOSED":"Crowdsale was closed from further investments",
				"CREATE":"was created",
				"CONFIRMATIONS":"Confirmations"
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
				"FALSE":"Finished Crowdsale"
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
			"TITLE":"Participate on {{property.name}} Crowdsale",
			"DESIREDCOIN":"Token to send",
			"MODAL_ESTIMATE":"Estimated amount of tokens",
			"ESTIMATE_LEAD":"You will recieve",
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
			"ACTIVE": "Active Offers",
			"TIMEFRAME" :"Time frame",
			"TOTAL": "Total Transactions"
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
			"MODALTITLE": "Confirm Sale"
		}
	}
})