module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-git');
	grunt.loadNpmTasks('grunt-shell');

	grunt.initConfig( {
		clean: {
			bower: ['www/bower_components', '.bowerrc'],
			git: [ 'node_modules/mastercoin-tools' ],
		},

		gitclone: {
			mastercointools: {
				options: {
					repository: 'https://github.com/mastercoin-MSC/mastercoin-tools.git',
                			branch: 'master',
                			directory: 'node_modules/mastercoin-tools'
				},
			},
			"bitcoinjs-lib": {
				options: {
					repository: "https://github.com/Omniwallet/bitcoinjs-lib.git",
					branch: 'master',
					directory: 'www/bower_components/bitcoinjs-lib'
				}
			},
			"crypto-js": {
				options: {
					repository: "https://github.com/scintill/crypto-js.git",
					branch: 'master',
					directory: 'www/bower_components/bitcoinjs-lib/src/crypto-js'
				}
			}
		},
		shell: {
			html: {
				command: "./gen_www.sh"
			},
			bower_install_directory: {
				options: {
					stdout: true,
					stderr: true
				},
				command: 'echo \'{ "directory": "www/bower_components" }\' > .bowerrc'
			},
			bower: {
				options: {
					stdout: true,
					stderr: true
				},
				command: 'bower install'
			},
			forge: {
				options: {
					stdout: true,
					stderr: true,
					execOptions: {
						cwd: "www/bower_components/forge"
					}
				},
				command: 'npm install ; npm run minify'
			},
			"omni-websocket": {
				options: {
					execOptions: {
						cwd: "api/websocket"
					}
				},
				command: 'npm install'
			},
			cryptolib: {
				options: {
					stdout: true,
					stderr: true,
					execOptions: {
						cwd: "www/bower_components/bitcoinjs-lib/src/crypto-js"
					}
				},
				command: "git checkout 17823c05f8b7338c077a2c00856a9c62263a6d16"
			},
			"bitcoinjs-lib": {
				options: {
					stdout: true,
					stderr: true,
					execOptions: {
						cwd: "www/bower_components/bitcoinjs-lib",
					}
				},
				command: ". ./build.sh"
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-clean' );

	grunt.registerTask( 'default', function( file ) {
		if( !grunt.file.exists( 'node_modules/mastercoin-tools' ))
			grunt.task.run( 'gitclone:mastercointools' );
		grunt.task.run( 'shell:bower' );
		if( !grunt.file.exists( 'www/bower_components/bitcoinjs-lib' ))
			grunt.task.run( 'gitclone:bitcoinjs-lib' );
		if( !grunt.file.exists( 'www/bower_components/bitcoinjs-lib/src/crypto-js/src/SHA1.js' )) {
			grunt.task.run( 'gitclone:crypto-js' );
			grunt.task.run( 'shell:cryptolib' );
    }
		if( !grunt.file.exists( 'www/bower_components/bitcoinjs-lib/build/bitcoinjs-lib.js' ) ||
			!grunt.file.exists( 'www/bower_components/bitcoinjs-lib/build/bitcoinjs-lib.min.js' ))
			grunt.task.run( 'shell:bitcoinjs-lib' );
		if( !grunt.file.exists( 'www/bower_components/forge/js/forge.min.js' ))
			grunt.task.run( 'shell:forge' );
		if( !grunt.file.exists( 'api/websocket/node_modules' ))
      grunt.task.run( 'shell:omni-websocket' );
	} );


};
