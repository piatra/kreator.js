var gulp = require('gulp');

var browserify = require('gulp-browserify');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');

var paths = {
	js  : {
		in: './lib/main.js',
		out: './lib/build'
	},
	css : {
		in: ['./css/*.styl'],
		out: './css'
	},
	html: {
		in: ['./views/*.jade'],
		out: './output'
	}
};

gulp.task('build-js', function(){
	return gulp.src(paths.js.in)
	.pipe(browserify({
		insertGlobals: true,
		debug: true
	}))
	.pipe(gulp.dest(paths.js.out));
});

gulp.task('build-css', function(){
	return gulp.src(paths.css.in)
	.pipe(stylus({
		set: ['compress']
	}))
	.pipe(gulp.dest(paths.css.out));
});

gulp.task('build-html', function(){
	return gulp.src(paths.html.in)
	.pipe(jade({}))
	.pipe(gulp.dest(paths.html.out));
});

gulp.task('watch', function() {
	gulp.watch(paths.js.in, ['build-js']);
	gulp.watch(paths.css.in, ['build-css']);
	gulp.watch(paths.html.in, ['build-html']);
});

gulp.task('default', ['build-js', 'build-html', 'build-css']);
