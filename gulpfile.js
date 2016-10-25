var browserSync  = require('browser-sync');

var source       = require('vinyl-source-stream');

var gulp           = require('gulp');
var gulpSequence = require('gulp-sequence');

var concat       = require('gulp-concat');

var ghPages     = require('gulp-gh-pages');

// deploy to gh-pages
gulp.task('deploy', function() {
    return gulp.src('./build/**/*')
    .pipe(ghPages());
    });


// libs: the third-party libs like Three.js, TweenLite, etc.
gulp.task('libs', function() {
 return gulp.src('./js/vendor/*.js')
 .pipe(gulp.dest('./build/js/vendor'));
 });

// js
gulp.task('js', function() {
  return gulp.src('./js/*.js')
  .pipe(gulp.dest('build/js'))
  });

// html
gulp.task('html', function() {
  return gulp.src('./*.html')
  //.pipe(processhtml())f
  .pipe(gulp.dest('build'))
  });

// css
gulp.task('css', function() {
  return gulp.src('./css/*.css')
  .pipe(gulp.dest('build/css'))
  });


// browser sync server for live reload
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: './build'
        }
        });
    gulp.watch('./*.html', ['html']);
    //gulp.watch('./src/scss/**/*.scss', ['sass']);
    gulp.watch('./css/*.css', ['css']);
    gulp.watch('./js/*.css', ['js']);
    });

// use gulp-sequence to finish building html, sass and js before first page load
gulp.task('default', gulpSequence(['html', 'css', 'libs', 'js'], 'serve')); // 'sass'