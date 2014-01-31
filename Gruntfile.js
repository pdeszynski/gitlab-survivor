module.exports = function(grunt) {
  var basePath = 'FilestubeDashboard/src/main/assets/www/';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      files: [basePath + 'less/**/*.less'],
      tasks: ['less']
    },

    less: {
      files: {
          expand: true,        // Enable dynamic expansion.
          cwd: basePath + 'less',  // Src matches are relative to this path.
          src: ['*.less'],     // Actual pattern(s) to match.
          dest: basePath + 'css',  // Destination path prefix.
          ext: '.css',         // Dest filepaths will have this extension.
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  //grunt.registerTask("watch-serve", "watch");

  // Default task(s).
  grunt.registerTask('default', ['less']);
}
