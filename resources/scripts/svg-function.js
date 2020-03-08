var types      = require( 'node-sass' ).types;
var fs         = require( 'fs' );
var encode_svg = require( '../../node_modules/node-sass-svg/lib/encode-svg' );

module.exports = {
	'inline-svg($filename)': function ( filename_sass ) {
		var filename = filename_sass.getValue();
		var svg      = fs.readFileSync( filename, 'utf8' );

		var encoded = encode_svg( svg );
		return new types.String( 'url("data:image/svg+xml,' + encoded + '")' );
	}
};
