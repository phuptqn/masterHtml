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
	wait 			= require('gulp-wait'),
	browserSync 	= require('browser-sync').create();

var paths = {
	source	: './source',
	dist	: './dist',
	vendor	: './dist/assets/vendor',
	bundles	: './dist/assets/bundles',
	min		: './dist/assets/min',
	views	: './source/views',
	js 		: './source/js',
	temp 	: './source/temp',
	scss	: './source/scss'
}

gulp.task('vendor_css', function () {
	return gulp.src([
			paths.vendor + '/bootstrap/dist/css/bootstrap.css',
			paths.vendor + '/font-awesome/css/font-awesome.css',
			paths.vendor + '/fancybox/source/jquery.fancybox.css',
			paths.vendor + '/slick-carousel/slick/slick.css'
		])
		.pipe(concat('vendor.css'))
		.pipe(gulp.dest(paths.bundles))
		.pipe(rename('vendor.min.css'))
		.pipe(cssnano({zindex: false}))
		.pipe(gulp.dest(paths.min));
});

gulp.task('sass', function () {
	return gulp.src([
			paths.scss + '/*.scss'
		])
		.pipe(wait(1000))
		.pipe(sass({
			outputStyle: 'expanded',
			indentType: 'space',
			indentWidth: 4
		}))
		.pipe(autoprefixer({
			browsers: ['last 10 versions']
		}))
		.pipe(concat('style.css'))
		.pipe(gulp.dest(paths.bundles))
		.pipe(rename('style.min.css'))
		.pipe(cssnano({zindex: false}))
		.pipe(gulp.dest(paths.min));
});

gulp.task('vendor_js', function () {
	return gulp.src([
			paths.vendor + '/bootstrap/dist/js/bootstrap.js',
			paths.vendor + '/fancybox/source/jquery.fancybox.js',
			paths.vendor + '/slick-carousel/slick/slick.js'
		])
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest(paths.bundles))
		.pipe(rename('vendor.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.min));
});

gulp.task('jshint', function () {
	return gulp.src(paths.js + '/*.js')
		.pipe(jshint({
			esversion: 6
		}))
		.pipe(jshint.reporter('default'))
});

gulp.task('babeljs', ['jshint'], function () {
	return gulp.src( paths.js + '/*.js' )
		.pipe(babel())
		.pipe(gulp.dest( paths.temp + '/babeljs' ));
});

gulp.task('js', ['babeljs'], function () {
	return gulp.src([
			paths.temp + '/babeljs/*.js'
		])
		.pipe(concat('script.js'))
		.pipe(gulp.dest(paths.bundles))
		.pipe(rename('script.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.min));
});

gulp.task('htmlinclude', function() {
	gulp.src([paths.views + '/*.html'])
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(gulp.dest(paths.dist));
});

gulp.task('default', ['vendor_js', 'vendor_css', 'htmlinclude', 'jshint', 'babeljs', 'js', 'sass'], function() {

	// Run server
	browserSync.init({
		server: "./dist"
	});

	// Run registerd tasks
	gulp.watch([
		paths.views + '/*/*.html',
		paths.views + '/*.html'
	], {cwd: './'}, ['htmlinclude']);

	gulp.watch([paths.js + '/*.js'], {cwd: './'}, ['js']);

	gulp.watch([
		paths.scss + '/*.scss',
		paths.scss + '/*/*.scss',
		paths.scss + '/*/*/*.scss'
	], {cwd: './'}, ['sass']);

	// Hot reload
	gulp.watch([
		paths.dist + '/*.html',
		paths.bundles + '/*.js',
		paths.bundles + '/*.css'
	]).on('change', browserSync.reload);

});