var gulp = require('gulp');
var ts = require('gulp-typescript');
var runSequence = require('run-sequence');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('default', function (callback) {
    return runSequence('ts', 'copy-files', function (error) {
        if (error) {
            console.error(error);
        }
        callback(error);
    });
});

gulp.task('ts', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist'));
});

gulp.task('copy-files', function () {
    return gulp.src('src/**/*.txt')
        .pipe(gulp.dest('dist'));
});
