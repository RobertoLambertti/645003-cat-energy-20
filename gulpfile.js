'use strict';

var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify-es').default;
var plumber = require('gulp-plumber');
var sourcemap = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var postcss = require('gulp-postcss');
var gcmq = require('gulp-group-css-media-queries');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var server = require('browser-sync').create();
var del = require('del');

gulp.task('pixelglass', function() {
  return gulp.src('source/.pixel-glass/*')
    .pipe(gulp.dest('build/.pixel-glass'));
});

gulp.task('html', function() {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
});


gulp.task('js', function() {
  return gulp.src([
    'source/js/menu.js',
    'source/js/slider.js',
    'source/js/demo.js',
    'source/js/map.js'
  ])
    .pipe(sourcemap.init())
    .pipe(uglify())
    .pipe(concat('script.min.js'))
    .pipe(sourcemap.write(''))
    .pipe(gulp.dest('build/js'));
});

gulp.task('css', function() {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('optiimg', function() {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.mozjpeg({progressive: true}),
    imagemin.svgo({
      plugins: [
        {convertStyleToAttrs: true},
        {removeStyleElement: true},
        {sortAttrs: true},
      ]
    })
  ]))
  .pipe(gulp.dest('source/img'));
});

gulp.task('svgo', function() {
  return gulp.src('source/img/**/*.svg')
  .pipe(imagemin([
    imagemin.svgo({
      plugins: [
        {convertStyleToAttrs: true},
        {removeStyleElement: true},
        {sortAttrs: true},
      ]
    })
  ]))
  .pipe(gulp.dest('source/img'));
});

gulp.task('webp', function() {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 85}))
    .pipe(gulp.dest('source/img'));
});

gulp.task('sprite', function() {
  return gulp.src('source/img/**/icon-*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'))
});

gulp.task('clean', function() {
  return del('build');
});

gulp.task('copy', function() {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/img/**',
    'source/*.ico'
  ], {
    base: 'source',
  })
  .pipe(gulp.dest('build'));
});

gulp.task('build', gulp.series(
  'clean',
  'copy',
  'sprite',
  'html',
  'css',
  'js'
));

gulp.task('refresh', function(done) {
  server.reload();
  done();
});

gulp.task('server', function() {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/sass/**/*.scss', gulp.series('css'));
  gulp.watch('source/img/**/icon-*.svg', gulp.series('sprite', 'html', 'refresh'));
  gulp.watch('source/*.html', gulp.series('html', 'refresh'));
  gulp.watch('source/js/**/*.js', gulp.series('js', 'refresh'));
});

gulp.task('start', gulp.series('css', 'server'));
