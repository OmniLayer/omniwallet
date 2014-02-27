var connect = require('connect'),
	connectRoute = require( 'connect-route' ),
    http = require('http'),
    url = require( 'url' ),
    qs = require( 'qs' )

connect(
		connect.bodyParser(),
		connectRoute( function( app ) {
			app.post( '/v1', function( req, res ) {
				console.log( 'POST!' );
			});
		})
	)
    .use(connect.static('www'))
    .listen(3000);