"user strict";
var gulp    = require('gulp'),
    bower   = require('gulp-bower'),
    jshint  = require('gulp-jshint'),
    refresh = require('gulp-livereload'),
    notify  = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    client  = require('tiny-lr')(),
    list    = require('gulp-task-listing'),
    nodemon = require('gulp-nodemon'),
    lr_port = 35729,
    less   = require('gulp-less'),
    stripDebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    ngmin = require('gulp-ngmin'),
    concat = require('gulp-concat')
    clean = require('gulp-clean')
    nodePath = require('path')
    minifycss = require('gulp-minify-css');

var paths = {
  scripts: ['!client/lib/**/*.js', 'client/**/*.js', '!client/*.min.js'],
  appjsminify: { src: ['!client/lib/**/*.js', 'client/**/*.js'], dest: 'client', filename: 'ngscripts.min.js' },
  mincss: {dest: 'client/styles/css.min'},
  views: ['!client/lib/*.html', '!client/styles/css.min/*.css', 'client/**/*.html', 'client/index.html'],
  styles: {
    css: ['!client/lib/**/*.css', 'client/styles/css/*.css', 'client/**/*.css'],
    less: ['client/styles/less/*.less', 'client/**/*.less'],
    dest: 'client/styles/css'
  }
};
var build = ['less', 'css', 'lint', 'distCode', 'minify-css'];

gulp.task('less' ,function () {
  return gulp.src(paths.styles.less)
    .pipe(plumber())
    .pipe(less({
      paths: [paths.styles.less]
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(refresh(client))
    .pipe(notify({message: 'Less done'}));
});

gulp.task('bowerInstall', function  () {
  bower()
  .pipe();
});

gulp.task('html', function () {
  return gulp.src(paths.views)
    .pipe(plumber())
    .pipe(refresh(client))
    .pipe(notify({message: 'Views refreshed'}));
});

gulp.task('css', ['deleteOldMin'],function () {
  return gulp.src(paths.styles.css)
    .pipe(plumber())
    .pipe(refresh(client))
    .pipe(notify({message: 'CSS refreshed'}));
});

gulp.task('lint', function () {
  return gulp.src(paths.scripts)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(refresh(client))
    .pipe(notify({message: 'Lint done'}));
});

gulp.task('serve', function () {
  nodemon({script: 'server.js', ignore: ['node_modules/**/*.js']})
    .on('restart', function () {
      refresh(client);
    });
});

gulp.task('live', function () {
  client.listen(lr_port, function (err) {
    if (err) {
      return console.error(err);
    }
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.styles.less, ['less']);
  gulp.watch(paths.views, ['html']);
  gulp.watch(paths.scripts, ['lint']);
});

gulp.task('copy', function(){
  gulp.src('./client/**/*', {base: './client'})
    .pipe(gulp.dest(paths.appjsminify.dest));
});

gulp.task('distCode', ['lint', 'deleteOldMin'], function() {
  return gulp.src(paths.appjsminify.src)
    .pipe(plumber())
    .pipe(stripDebug())
    .pipe(ngmin({dynamic: false}))
    .pipe(uglify({mangle: false}))
    .pipe(concat(paths.appjsminify.filename))
    .pipe(gulp.dest(paths.appjsminify.dest))
    .pipe(notify({message: 'Distribution code compiled'}));
});

gulp.task('deleteOldMin', function() {
  return gulp.src([nodePath.join(paths.appjsminify.dest, paths.appjsminify.filename), paths.mincss.dest], {read: false})
    .pipe(plumber())
    .pipe(clean())
    .pipe(notify({message: 'Old file deleted'}));
});

gulp.task('minify-css', ['deleteOldMin' , 'less'], function () {
  return gulp.src(paths.styles.css)
    .pipe(plumber())
    .pipe(minifycss({keepBreaks:true}))
    .pipe(gulp.dest(paths.mincss.dest))
    .pipe(notify({message: 'CSS minified'}));
});

gulp.task('build', build);
gulp.task('default', ['build', 'live', 'serve', 'watch']);