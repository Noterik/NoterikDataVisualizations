module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    "bower-install-simple": {
        options: {
            color: true,
            directory: "lib"
        },
        "prod": {
            options: {
                production: true
            }
        },
        "dev": {
            options: {
                production: false
            }
        }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/*.js']
    },
    concat: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */',
      },
      dist: {
        src: ['src/*.js'],
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>.concat.js',
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/<%= pkg.name %>-<%= pkg.version %>.concat.js',
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks("grunt-bower-install-simple");

  // Default task(s).
  grunt.registerTask('default', ['install', 'build']);
  grunt.registerTask('install', ['bower-install-simple']);
  grunt.registerTask('build', ['jshint', 'concat', 'uglify']);
};
