module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-git');
	grunt.loadNpmTasks('grunt-shell');

	grunt.initConfig( {
		gitclone: {
			mastercointools: {
				options: {
					repository: 'https://github.com/curtislacy/mastercoin-tools.git',
                			branch: 'Specify-Directory',
                			directory: 'node_modules/mastercoin-tools'
				},
			}
		},
		shell: {
			html: {
				command: "./gen_www.sh"
			}
		}
	} );

	grunt.registerTask( 'default', function( file ) {
		if( !grunt.file.exists( 'node_modules/mastercoin-tools' ))
			grunt.task.run( 'gitclone:mastercointools' );
		grunt.task.run( 'shell:html' );
	} );

	grunt.registerTask( 'build', 'shell:html' );
};
