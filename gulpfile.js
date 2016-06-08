var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename');
    uglify = require('gulp-uglify');

gulp.task('default', function() {
  gulp.start('jshint');
});

gulp.task('jshint', function() {
  return gulp.src('datepicker.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('build', ['jshint'], function() {
  return gulp.src('datepicker.js')
    .pipe(gulp.dest('dist'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
});
