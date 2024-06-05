"use strict"

const {src, dest} = require("gulp")
const gulp = require("gulp")
const sass = require("gulp-sass")(require("sass"))
const plumber = require("gulp-plumber")
const notify = require("gulp-notify")
const rename = require("gulp-rename")
const cssnano = require("gulp-cssnano")
const fileinclude = require('gulp-file-include')
const uglify = require("gulp-uglify-es").default
const imagemin = require("gulp-imagemin")
const del = require("del")
const browsersync = require("browser-sync").create()
const newer = require("gulp-newer")
const concat = require("gulp-concat")

/* Paths */

const srcPath = "src/"
const distPath = "dist/"

const path = {
    build: {
        html: distPath,
        css: distPath + "css",
        js: distPath + "js",
        images: distPath + "images",
        fonts: distPath + "fonts"
    },
    src: {
        html: srcPath + "*.html",
        css: srcPath + "scss/*.scss",
        js: srcPath + "js/*.js",
        images: srcPath + "images/**/*.{jpeg,jpg,png,gif,webp,svg}",
        fonts: srcPath + "fonts/**/*.{woff,woff2,ttf,eot,svg}"
    },
    watch: {
        html: srcPath + "**/*.html",
        css: srcPath + "scss/**/*.scss",
        js: srcPath + "js/**/*.js",
        images: srcPath + "images/**/*.{jpg,jpeg,png,gif,webp,svg}",
        fonts: srcPath + "fonts/**/*.{woff,woff2,ttf,eot,svg}",
    },
    clean: "./" + distPath
}

function server(){
    browsersync.init({
        server: {
            baseDir: distPath,
            index: 'index.html'
        },
        notify: false,
        port: 3000,
    })
}

function html(){
    return src(path.src.html, {base: srcPath})
    .pipe(plumber({
        errorHandler: function (err){
            notify.onError({
                title: "HTML",
                message: "Error: <%= error.message %>"
            })(err);
            this.emit('end');
        }
    }))
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.reload({stream: true}))
}

function css(){    
    return src(path.src.css, {base: srcPath + "scss/"})
    .pipe(plumber({
        errorHandler: function (err){
            notify.onError({
                title: "SCSS",
                message: "Error: <%= error.message %>"
            })(err);
            this.emit('end');
        }
    }))
    .pipe(sass())
    .pipe(cssnano())
    .pipe(concat("styles.css"))
    .pipe(rename({
        extname: ".min.css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.reload({stream: true}))
}

function js(){
    return src(path.src.js, {base: srcPath + "js/"})
    .pipe(plumber({
        errorHandler: function (err){
            notify.onError({
                title: "JS",
                message: "Error: <%= error.message %>"
            })(err);
            this.emit('end');
        }
    }))
    .pipe(fileinclude())
    .pipe(uglify())
    .pipe(rename({
        extname: ".min.js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.reload({stream: true}))
}

function images(){
    return src(path.src.images, {base: srcPath + "images/" })
    .pipe(plumber({
        errorHandler: function (err){
            notify.onError({
                title: "IMAGES",
                message: "Error: <%= error.message %>"
            })(err);
            this.emit('end');
        }
    }))
    .pipe(newer(path.build.images))
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest(path.build.images))
}

function fonts(){
    return src(path.src.fonts, {base: srcPath + "fonts/" })
    .pipe(dest(path.build.fonts))
}

function clean(){
    return del(path.clean)
}

function watcher(){
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.images], images)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.fonts], fonts)
}

const build = gulp.series( clean, gulp.parallel(html, images, css, js))
const watch = gulp.parallel(build, watcher, server)


exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
exports.server = server;




