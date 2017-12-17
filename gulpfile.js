var gulp = require('gulp');
var ts = require('gulp-typescript');
var runSequence = require('run-sequence');
var tsProject = ts.createProject('tsconfig.json');
var watch = require('gulp-watch');
var del = require('del');

gulp.task('default', function (callback) {
    return runSequence('clean', 'ts', 'copy-files', function (error) {
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
    return gulp.src('src/**/*.json')
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function (callback) {
    return watch('src/**/*.ts', function () {
        runSequence('ts', function (error) {
            if (error) {
                console.error(error);
            }
            callback(error);
        });
    });
});

gulp.task('clean', function (callback) {
    return del([
        'src/services/updater-assets/decompiled/',
        'src/services/updater-assets/client.swf',
        'dist/'
    ]);
})
