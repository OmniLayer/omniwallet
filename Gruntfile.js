module.exports = function(grunt) {
	var initConfig = {
	gitclone: {
		mastercointools: {
			options: {
				repository: 'https://github.com/grazcoin/mastercoin-tools.git',
                		branch: 'master',
                		directory: 'node_modules/mastercoin-tools'
			}
		}
	},
};

	grunt.initConfig( initConfig );
	grunt.loadNpmTasks('grunt-git');
	grunt.registerTask( 'default', 'gitclone' );
};
