var connect = require('connect'),
    express = require( 'express' ),
    http = require('http'),
    url = require( 'url' ),
    qs = require( 'qs' ),
    fs = require( 'fs' )

var postPaths = [
	'/v1/user/wallet/sync',
	'/v1/user/wallet/restore/',
	'/v1/address/addr/'
];

var app = express();

app.configure( function() {
    app.use(connect.static('www'))

} );

postPaths.forEach( function( path ){
	app.post( path, processPost );
} );

app.listen(3000);

function processPost( req, res ) {
	var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {

            var POST = qs.parse(body);
            // use POST
            if( req.route.path.indexOf( 'address/addr' ) >= 0 )
            {
            	console.log( 'Addr request, address: ' + POST.addr );
            }
            else if ( req.route.path.indexOf( 'wallet/restore' ) >= 0 )
            {
            	var file = "www" + req.route.path + POST.email;
            	console.log( 'Restore wallet from ' + file );
            	fs.readFile( file, function (err, data) {
                    console.log( data.toString( 'utf8' ) );
				  if (err) throw err;
                  
                  var obj = JSON.parse( data.toString( 'utf8' ));
                  res.json( obj );
				});
            }
            else
            {
            	console.log( 'Unknown submission, data: ' );
            	console.log( POST );
            }
        });
}