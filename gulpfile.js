var gulp = require('gulp');
var pug = require('gulp-pug');
var stylus = require('gulp-stylus');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync');
var server = browserSync.create();
var concat = require('gulp-concat');
var del = require('del');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var svgSprite = require("gulp-svg-sprites");
var sass = require('gulp-sass');

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: './build'
    }
  });
  done();
}

var pugFiles = [
  'src/*.pug',
  '!layouts/**',
  '!blocks/**'
];

gulp.task('pug', function () {
  return gulp.src(pugFiles)
    .pipe(pug({
    	pretty:true
    }))
    .pipe(gulp.dest('build/'))
});

var jsFiles = [
  'src/vendor/**/*.js',
  'src/blocks/**/*.js',
  'src/assets/**/*.js'
];

gulp.task('js', function() {
  return gulp.src(jsFiles)
    .pipe(concat('assets/app.js'))
    .pipe(gulp.dest('build/'));
});

var imgFiles = [
  'src/assets/**/*.{jpg,png,jpeg,svg,gif}',
];

gulp.task('img', function() {
  return gulp.src(imgFiles)
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]      
    }))
    .pipe(gulp.dest('build/assets'));
});

var stylFiles = [
  'src/assets/**/*.styl',
  'src/blocks/**/*.styl',
];
gulp.task('stylus', function () {
var postCSSPlugins = [
    autoprefixer({browsers: ['last 10 version']})
];
  return gulp.src(stylFiles)
    .pipe(stylus())
    .pipe(postcss(postCSSPlugins))
    .pipe(concat('assets/app.css'))
    .pipe(gulp.dest('build/'))
    .pipe(server.stream())
});

gulp.task('sass', function () {
  return gulp.src('src/vendor/scss/bootstrap.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('build/assets/'))
    .pipe(server.stream());
});

gulp.task('svg', function () {
  return gulp.src('src/assets/svg/*.svg')
  .pipe(svgSprite())
  .pipe(gulp.dest("build/assets/"));
});

gulp.task('watch', function(){
  gulp.watch('src/**/*.styl', gulp.series('stylus'));
  gulp.watch('src/**/*.scss', gulp.series('sass'));
  gulp.watch('src/**/*.pug', gulp.series('pug', reload));
  gulp.watch('src/**/*.js', gulp.series('js', reload));
  gulp.watch(imgFiles, gulp.series('img', reload));
  gulp.watch('src/**/*.svg', gulp.series('svg', reload));
});

gulp.task('build', gulp.parallel('stylus', 'pug', 'js', 'img', 'svg', 'sass'));

gulp.task('clean', function() {
  return del('build/')
});

gulp.task('serve', gulp.parallel('watch', serve));

gulp.task('default', gulp.series('clean', 'build', 'serve', 'sass'));