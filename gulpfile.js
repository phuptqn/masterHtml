'use strict';

var gulp 			= require('gulp'),
	sass 			= require('gulp-sass'),
	autoprefixer 	= require('gulp-autoprefixer'),
	fileinclude 	= require('gulp-file-include'),
	concat 			= require('gulp-concat'),
	uglify 			= require('gulp-uglify'),
	jshint 			= require('gulp-jshint'),
	cssnano 		= require('gulp-cssnano'),
	rename 			= require('gulp-rename'),
	babel 			= require('gulp-babel'),
	browserSync 	= require('browser-sync').create();

var paths = {
	source	: './source',
	dist	: './dist',
	vendor	: './dist/assets/vendor',
	bundles	: './dist/assets/bundles',
	min		: './dist/assets/min',
	views	: './source/views',
	js 		: './source/js',
	scss	: './source/scss'
}

gulp.task('sass', function () {
	return gulp.src([
			paths.vendor + '/bootstrap/dist/css/bootstrap.css',
	  		paths.vendor + '/font-awesome/css/font-awesome.css',
	  		paths.vendor + '/fancyBox/dist/jquery.fancybox.css',
	  		paths.vendor + '/FlexSlider/flexslider.css',
			paths.scss + '/*.scss'
		])
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 5 versions']
		}))
		.pipe(concat('style.css'))
		.pipe(gulp.dest(paths.bundles))
		.pipe(rename('style.min.css'))
		.pipe(cssnano({zindex: false}))
		.pipe(gulp.dest(paths.min))
		.pipe(browserSync.stream());
});

gulp.task('babeljs', function () {
	return gulp.src( paths.js + '/*.js' )
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest( paths.js + '/dist' ));
});

gulp.task('js', function () {
	return gulp.src([
			paths.vendor + '/fancyBox/dist/jquery.fancybox.js',
			paths.vendor + '/FlexSlider/jquery.flexslider.js',
			paths.vendor + '/lodash/dist/lodash.js',
			paths.js + '/dist/*.js'
		])
		.pipe(concat('script.js'))
		.pipe(gulp.dest(paths.bundles))
		.pipe(rename('script.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.min));
});

gulp.task('htmlinclude', function() {
	gulp.src([paths.views + '/pages/*.html'])
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(gulp.dest(paths.dist));
});

gulp.task('jshint', function () {
	return gulp.src(paths.js + '/*.js')
		.pipe(jshint({
			esversion: 6
		}))
		.pipe(jshint.reporter('default'))
});

gulp.task('jsreload', ['jshint', 'babeljs', 'js'], function (done) {
	browserSync.reload();
	done();
});

gulp.task('default', ['htmlinclude', 'jshint', 'babeljs', 'js', 'sass'], function() {

	browserSync.init({
		server: "./dist"
	});

	gulp.watch([
		paths.scss + '/*.scss',
		paths.scss + '/*/*.scss',
		paths.scss + '/*/*/*.scss'
	], {cwd: './'}, ['sass']);

	gulp.watch([paths.js + '/*.js'], {cwd: './'}, ['jsreload']);

	gulp.watch([
		paths.views + '/pages/*.html',
		paths.views + '/partials/*.html'
	], {cwd: './'}, ['htmlinclude']);

	gulp.watch(paths.dist + '/*.html').on('change', browserSync.reload);

});