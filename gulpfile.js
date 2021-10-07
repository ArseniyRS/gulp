const { src, dest, parallel, series, watch } = require('gulp');
const sync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('node-sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const del = require('del');
const htmlmin = require('gulp-htmlmin')
const include = require('gulp-file-include')


function html() {
    return src('src/*.html')
        .pipe(include({
            prefix: '@@'
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest('dist'))
}

function browsersync() {
    sync.init({ 
        server: { baseDir: 'dist/' },
        notify: false, 
        online: true 
    })
}

function scripts() {
    return src([
        //'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
        'src/js/**.js', 
    ])
        .pipe(concat('bundle.min.js'))
        .pipe(uglify()) 
        .pipe(dest('dist')) 
        .pipe(sync.stream())
}

function styles() {
    return src('src/scss/**.scss') 
        .pipe(sass())
        .pipe(concat('styles.min.css')) 
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) 
        .pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) 
        .pipe(dest('dist'))
        .pipe(sync.stream()) 
}


 const copy = () => {
    return src([
            'src/assets/fonts/**/*',
            'src/assets/img/**/*',
        ], {
            base: 'src'
        })
        .pipe(dest('dist'))
        .pipe(sync.stream({
            once: true
        }));
};


function cleandist() {
    return del('dist/**/*', { force: true }) 
}

function startwatch() {
    watch('src/**.html', series(html)).on('change', sync.reload)
    watch('src/parts/**.html', series(html)).on('change', sync.reload)
    watch(['src/**/*.js', '!src/**/*.min.js'], series(scripts));
    watch('src/scss/**.scss', series(styles));
    watch([
        'src/assets/fonts/**/*',
        'src/assets/images/**/*',
    ], series(copy));

}

exports.sync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.build = series(cleandist, styles, scripts ,html, copy);
exports.default = parallel(cleandist, styles, scripts, copy, html, browsersync, startwatch);