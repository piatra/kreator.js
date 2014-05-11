var gulp = require('gulp');

var browserify = require('browserify');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var fs = require('fs');
var mold = require('mold-source-map');

var paths = {
	js  : {
		in: './lib/main.js',
		out: './lib/build/main.js'
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

gulp.task('browserify', function(){
    browserify(paths.js.in)
    .bundle({debug: true})
    .pipe(mold.transformSourcesRelativeTo(__dirname))
    .pipe(fs.createWriteStream(paths.js.out));
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
	gulp.watch('./lib/*.js', ['browserify']);
	gulp.watch(paths.css.in, ['build-css']);
	gulp.watch(paths.html.in, ['build-html']);
});

gulp.task('default', ['build-js', 'build-html', 'build-css']);
