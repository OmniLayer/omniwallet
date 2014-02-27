var connect = require('connect'),
	connectRoute = require( 'connect-route' ),
    http = require('http'),
    url = require( 'url' ),
    qs = require( 'qs' ),
    fs = require( 'fs' )

var postPaths = [
	'/v1/user/wallet/sync',
	'/v1/user/wallet/restore/',
	'/v1/address/addr/'
];

connect(
		connectRoute( function( app ) {
			postPaths.forEach( function( path ){
				app.post( path, processPost );
			} );
		})
	)
    .use(connect.static('www'))
    .listen(3000);

function processPost( req, res ) {
	var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {

            var POST = qs.parse(body);
            // use POST
            console.log( 'POST Data: ' );

            if( req.route.indexOf( 'address/addr' ) >= 0 )
            {
            	console.log( 'Addr request, address: ' + POST.addr );
            }
            else if ( req.route.indexOf( 'wallet/restore' ) >= 0 )
            {
            	var file = "www" + req.route + POST.email;
            	console.log( 'Restore wallet from ' + file );
            	fs.readFile( file, function (err, data) {
				  if (err) throw err;
				  res.write( data );
				  res.end();
				});
            }
            else
            {
            	console.log( 'Unknown submission, data: ' );
            	console.log( POST );
            }
        });
	res.end();
}