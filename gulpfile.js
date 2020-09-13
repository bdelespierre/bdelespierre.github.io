var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var concat = require("gulp-concat");
var minify = require("gulp-minify");
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

function fonts() {
  // Devicons & Font Awesome
  return gulp
    .src([
      './node_modules/devicon/fonts/*',
      './node_modules/@fortawesome/fontawesome-free/webfonts/*'
    ])
    .pipe(gulp.dest('./dist/css/fonts'))
}

function css() {
  return gulp.src('./app/scss/**/*.scss')
    .pipe(sass.sync({ outputStyle: 'expanded' })
    .on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream())
}

function js() {
  return gulp.src([
      './node_modules/jquery/dist/jquery.js',
      './node_modules/jquery.easing/*.js',
      './node_modules/bootstrap/dist/js/bootstrap.bundle.js',
      './app/scripts/*.js',
    ])
    .pipe(rename({ suffix: '.min' }))
    .pipe(concat('all.js'))
    .pipe(minify({ ext:{ src:'.js', min:'.min.js' } }))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.stream())
}

exports.default = gulp.series(
  fonts, css, js
);

exports.browserSync = function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
}
