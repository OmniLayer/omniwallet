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
					repository: 'https://github.com/curtislacy/mastercoin-tools.git',
                			branch: 'master',
                			directory: 'node_modules/mastercoin-tools'
				},
			},
			"bitcoinjs-lib": {
				options: {
					repository: "https://github.com/BitGo/bitcoinjs-lib.git",
					branch: 'master',
					directory: 'www/bower_components/bitcoinjs-lib'
				}
			}
		},
		shell: {
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
			submodules: {
				options: {
					stdout: true,
					stderr: true,
					execOptions: {
						cwd: "www/bower_components/bitcoinjs-lib"
					}
				},
				command: "git submodule update --init"
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
		grunt.task.run( [ 'shell:bower_install_directory', 'shell:bower' ]);

		if( !grunt.file.exists( 'www/bower_components/bitcoinjs-lib' ))
			grunt.task.run( 'gitclone:bitcoinjs-lib' );
		if( !grunt.file.exists( 'www/bower_components/bitcoinjs-lib/src/crypto-js/src' ))
			grunt.task.run( 'shell:submodules' );
		if( !grunt.file.exists( 'www/bower_components/bitcoinjs-lib/build/bitcoinjs-lib.js' ) ||
			!grunt.file.exists( 'www/bower_components/bitcoinjs-lib/build/bitcoinjs-lib.min.js' ))
			grunt.task.run( 'shell:bitcoinjs-lib' );

	} );

	grunt.registerTask( 'clean', 'clean' );
};
