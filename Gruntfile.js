'use strict';

module.exports = function (grunt) {


  grunt.initConfig({
    uglify: {
      options: {
        mangle: false
      },
      all: {
        files: {
          'app/object-pool.min.js': ['app/object-pool.js'],
          'example/object-pool.min.js': ['app/object-pool.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('build', ['uglify']);

};