var gulp = require('gulp');
var browserify = require('gulp-browserify');

gulp.task('browserify', function() {
  return gulp.src(['./index.js'])
    .pipe(browserify({
      debug : true,
      "fullPaths": true
    }))
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
