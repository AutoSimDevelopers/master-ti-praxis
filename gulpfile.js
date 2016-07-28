var gulp = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload'),
    wiredep = require('wiredep'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    mainBowerFiles = require('gulp-main-bower-files'),
    concat = require('gulp-concat'),
    fileSort = require('gulp-angular-filesort'),
    useref = require('gulp-useref'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename');

var paths = {
    js: 'app/js/**/*.js',
    views: 'app/view*/*.html',
    sass: 'app/styles/**/*scss',
    css: 'app/styles/**/*.css',
    images: 'app/images/**/*',
    dist: './dist',
    index: './app/index.html',
    all: './app/**/*.*',
    tests: 'unit-tests/spec/*.js'
};

var pipes = {};
pipes.uglifyAndConcat = function () {
    return;
};
///////////////////////////
// JAVASCRIPT
////////////////////////////
gulp.task('pda', function () {
    return gulp.src(['app/js/pda/*.js', '!app/js/pda/PDAall.js', '!app/js/pda/PDAall.min.js'])
        .pipe(concat('PDAall.js'))
        .pipe(gulp.dest('app/js/pda/'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('app/js/pda/'));
});

gulp.task('dfa', function () {
    return gulp.src(['app/js/dfa/*.js', '!app/js/dfa/DFAall.js', '!app/js/dfa/DFAall.min.js'])
        .pipe(concat('DFAall.js'))
        .pipe(gulp.dest('app/js/dfa/'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('app/js/dfa/'));
});

///////////////////////////
// Styles
////////////////////////////
gulp.task('styles', function () {
    gulp.src('app/styles/sass/style.scss')
        .pipe(sass().on('error', sass.logError))
        //save css
        .pipe(gulp.dest('app/styles/css'))
        //minify
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        //save minifed version
        .pipe(gulp.dest('app/styles/css'));

});

///////////////////////////
// Get, uglify and copy application js
////////////////////////////

gulp.task('assets', function () {
    var assets = useref.assets({
        noconcat: true
    });

    gulp.src(paths.index)
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest(paths.dist));
});

/////////////////////////////////////////////////
// Copy dependencys of index.html
/////////////////////////////////////////////////

gulp.task('wiredep-js', function () {
    console.log(wiredep().js);
    gulp.src(wiredep().js)
        .pipe(fileSort())
        .pipe(gulp.dest(paths.dist + '/scripts/vendor'));
});

gulp.task('wiredep-css', function () {
    gulp.src(wiredep().css)
        .pipe(gulp.dest(paths.dist + '/vendor'));
});

////////////////////////////////////////////////
// Copy html templates
////////////////////////////////////////////////

gulp.task('views', function () {
    gulp.src(paths.views)
        .pipe(gulp.dest(paths.dist + '/views'));
});

////////////////////////////////////////////////
// Copy images
////////////////////////////////////////////////

gulp.task('images', function () {
    gulp.src(paths.images)
        .pipe(gulp.dest(paths.dist + '/images'));
});

////////////////////////////////
// Copy fonts
////////////////////////////////
gulp.task('fonts', function () {
    gulp.src(paths.fonts)
        .pipe(gulp.dest(paths.dist + '/fonts'));

    gulp.src(paths.vendorFonts)
        .pipe(gulp.dest(paths.dist + '/vendor'));
});


////////////////////////////////////////////////
// Wiredep index.html
////////////////////////////////////////////////

gulp.task('index', function () {
    gulp.src(paths.index)
        .pipe(wiredep.stream({
            fileTypes: {
                html: {
                    replace: {
                        js: function (filePath) {
                            return '<script src="' + 'scripts/vendor/' + filePath.split('/').pop() + '"></script>';
                        },
                        css: function (filePath) {
                            return '<link rel="stylesheet" href="' + 'vendor/' + filePath.split('/').pop() + '"/>';
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest(paths.dist));
});

//////////////////////////////////
// Dev liveload
//////////////////////////////////
gulp.task('live', function () {
    connect.server({
        port: 9010,
        livereload: true,
    });
    gulp.watch(paths.sass, ['styles']);
    gulp.watch("app/js/dfa/*.js", ['dfa']);
    gulp.watch("app/js/pda/*.js", ['pda']);
    gulp.watch(paths.all, function (obj) {
        if (obj.type === 'changed') {
            console.log(obj.path + ' changed');
            gulp.src(obj.path, {
                    base: './app/'
                })
                .pipe(connect.reload());
        }
    });
    //watch unit test changes0
    gulp.watch(paths.tests, function (obj) {
        if (obj.type === 'changed') {
            console.log(obj.path + ' changed');
            gulp.src(obj.path, {
                    base: './app/'
                })
                .pipe(connect.reload());
        }
    });

});

gulp.task('liveDist', function () {
    connect.server({
        port: 9000,
        livereload: true,
        root: './dist',
        middleware: function () {
            return [
        modRewrite([
          '^/api/v1/(.*)$ http://localhost:3000/api/v1/$1 [P]'
        ])
      ];
        }
    });
});

//////////////////////////////////
// Watcher
/////////////////////////////////
gulp.task('watch', function () {
    livereload.listen({
        port: 3000,
        basePath: 'app'
    });
});

/////////////////////////////////////////////////
//  Development Task
/////////////////////////////////////////////////
//gulp.task('dev', ['setupDev', 'scripts', 'html',  'fonts', 'bower', 'watch'])

gulp.task('build', ['wiredep-js', 'wiredep-css', 'assets', 'views', 'images', 'fonts', 'index']);