'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('browserify', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './index.js',
    debug: true,
  });

  return b.bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./build/'));
});



gulp.task('watch', function() {
  gulp.watch(['./**/*.js', './*.js'], ['build']);
});

gulp.task('build', [
  'browserify'
]);

gulp.task('default', [
  'watch',
  'build'
]);
