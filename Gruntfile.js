module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-git');
	grunt.loadNpmTasks('grunt-shell');

	grunt.initConfig( {
		clean: {
			bower: ['www/bower_components', '.bowerrc'],
			git: [ 'node_modules/mastercoin-tools' ],
			html: [ 'Address.html', 'index.html', 'simplesend.html' ]
		},

		gitclone: {
			mastercointools: {
				options: {
					repository: 'https://github.com/curtislacy/mastercoin-tools.git',
                			branch: 'master',
                			directory: 'node_modules/mastercoin-tools'
				},
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
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-clean' );

	grunt.registerTask( 'default', function( file ) {
		if( !grunt.file.exists( 'node_modules/mastercoin-tools' ))
			grunt.task.run( 'gitclone:mastercointools' );
		grunt.task.run( 'shell' );
	} );

	grunt.registerTask( 'build', 'shell' );
	grunt.registerTask( 'clean', 'clean' );
};
