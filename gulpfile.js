'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const spawn = require('child_process').spawn;
let node;

let sources = {
    scripts: {
        path: ['./src/**']
    },
    e2e: {
        path: ['./e2e/**']
    }
};

gulp.task('manageServer', manageServer);
gulp.task('runUnitTests', runUnitTests);
gulp.task('develop', gulp.series('manageServer', 'runUnitTests'));

function runUnitTests(done) {
    return gulp.watch(
        [`${sources.scripts.path}/*.spec.js`],
        {ignoreInitial: true},
        runUnitTests
    );

    function runUnitTests(done) {
        return gulp
            .src([`${sources.scripts.path}/*.spec.js`])
            .pipe(mocha({reporter: 'list', bail: true}))
            .on('error', function(err) {
                console.log(err.stack);
            })
            .once('end', function() {
                done();
            });
    }
}

function manageServer(done) {
    gulp.watch(
        ['./index.js', `${sources.scripts.path}`],
        {
            ignoreInitial: false,
            ignored: ['**/*.spec.js']
        },
        runServer
    );
    done();
    function runServer(done) {
        if (node) node.kill();
        node = spawn('node', ['index.js'], {stdio: 'inherit'});
        node.on('close', function(code) {
            if (code === 8) {
                gulp.log('Error detected, waiting for changes...');
            }
        });
        done();
    }
}
