module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-junit-reporter'), // Aggiunto il plugin per JUnit
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // Configurazioni opzionali per Jasmine
      },
    },
    jasmineHtmlReporter: {
      suppressAll: true // Rimuove i log duplicati
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/gls-eva-frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    junitReporter: {
      outputDir: './test-result', // Directory di output per i risultati
      outputFile: 'junit-test.xml', // Nome del file XML
      suite: '', // Nome del pacchetto (opzionale)
      useBrowserName: true, // Aggiunge il nome del browser al report
    },
    reporters: ['progress', 'kjhtml', 'junit'], // Aggiunto 'junit' ai reporters
    browsers: ['Chrome'], // Usa ChromeHeadless per esecuzione senza UI
    restartOnFileChange: true
  });
};