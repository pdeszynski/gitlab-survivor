module.exports = function(config){
  config.set({

    basePath : './FilestubeDashboard/src/main/assets/',

    files : [
      'www/components/angular/angular.js',
      'www/components/angular-route/angular-route.js',
      'www/components/angular-resource/angular-resource.js',
      'www/components/angular-mocks/angular-mocks.js',
      'www/js/**/*.js',
      'www/js/view*/**/*.js',
      'www/partial*/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
