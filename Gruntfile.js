/* eslint-env node */
module.exports = function (grunt) {

    var libPath = 'app/lib';

    grunt.initConfig({
        'bower': {
            dev: {
                dest: libPath,
                options: {
                    stripAffix: true,
                    packageSpecific: {
                        'angular-mocks': {
                            dest: 'test/lib',
                            files: [
                                'angular-mocks.js'
                            ]
                        },
                        'bootstrap': {
                            dest: libPath,
                            files: [
                                'dist/js/bootstrap.js',
                                'dist/css/bootstrap.css',
                                'dist/css/bootstrap-theme.css',
                                'dist/fonts/glyphicons-halflings-regular.eot',
                                'dist/fonts/glyphicons-halflings-regular.woff',
                                'dist/fonts/glyphicons-halflings-regular.woff2',
                                'dist/fonts/glyphicons-halflings-regular.ttf'
                            ]
                        },
                        'jasmine-promise-matchers': {
                            dest: 'test/lib',
                            files: [
                                'dist/jasmine-promise-matchers.js'
                            ]
                        },
                        'jquery': {
                            dest: libPath,
                            files: [
                                'dist/jquery.min.js'
                            ]
                        }
                    }
                }
            }
        },
        'eslint': {
            target: ['./']
        },
        'karma': {
            unit: {
                configFile: 'test/karma.conf.js'
            },
            dev: {
                configFile: 'test/karma.conf.js',
                singleRun: false,
                autoWatch: true
            }
        },
        'connect': {
            server: {
                options: {
                    base: 'app',
                    hostname: "127.0.0.1",
                    port: 8081,
                    open: true,
                    keepalive: true
                }
            }
        },
        'gh-pages': {
            options: {
                base: 'app',
                message: 'Publish to github pages from grunt'
            },
            'prod': {
                options: {
                    repo: 'git@github.com:Pragmatists/OpenTrappUI.git'
                },
                src: '**/*'
            },
            'dev-mpi': {
                options: {
                    repo: 'git@github.com:mpi/OpenTrappUI.git'
                },
                src: '**/*'
            }
        },
        'exec': {
            generate_parser: {
                cmd: function () {
                    var path = require('path');
                    var pegjs = "node_modules" + path.sep + ".bin" + path.sep + "pegjs";
                    var parserVar = "-e PegWorkLogEntryParser";
                    var inputGrammar = "WorkLogEntryGrammar.pegjs";
                    var outputParser = "app" + path.sep + "lib" + path.sep + "PegWorkLogEntryParser.js";
                    return pegjs + " " + parserVar + " " + inputGrammar + " " + outputParser;
                }
            },
            'json_server': {
                cmd: 'node api/server.js'
            }
        },
        'concurrent': {
            'server': {
                tasks: ['connect:server', 'exec:json_server'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    grunt.registerTask('cleanLib', function () {
        var rimraf = require('rimraf');
        var done = this.async();
        rimraf(libPath, function () {
            grunt.log.writeln('Directory ' + libPath + ' removed.');
            done();
        });
    });

    grunt.loadNpmTasks('grunt-bower');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('default', ['cleanLib', 'bower', 'exec:generate_parser', 'eslint', 'karma:unit']);
    grunt.registerTask('server', ["default", 'connect']);
    grunt.registerTask('api', ['exec:json_server']);
    grunt.registerTask('all', ['concurrent:server']);
};
