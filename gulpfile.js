const gulp = require('gulp');
const notify = require('gulp-notify');
const folderToc = require('folder-toc');
const docco = require('gulp-docco');
const {deleteSync} = require("del");
const connect = require('gulp-connect');
const hb = require('gulp-hb');
const frontMatter = require('gulp-front-matter');
const rename = require('gulp-rename');
const config = require('./config');
const gutil = require('gulp-util');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const fs = require('fs');

function watch() {
  gulp.watch(config.globs.other, staticFiles);
  gulp.watch([
    config.globs.templates,
    config.globs.data,
    config.globs.helpers,
    config.globs.partials,
  ].flat(), markup);
  gulp.watch([
    config.globs.js,
  ].flat(), bundle);
  gulp.watch([
    config.globs.sass,
  ].flat(), gulp.series(bundle, markup));
  gulp.watch(config.globs.js, docs);
}

function docsTOC(cb) {
  folderToc('./docs', {
    filter: '*.html',
  });
  cb();
}

function docsFiles() {
  return gulp.src(config.globs.js)
    .pipe(docco())
    .pipe(gulp.dest('./docs'));
}

function server() {
  gulp.watch(config.buildPath('**/*'), function(file) {
    return gulp.src(file.path).pipe(connect.reload());
  });

  return connect.server({
    root: config.buildRoot,
    livereload: true,
  });
}

function staticFiles() {
  return gulp.src(config.globs.other, { base: './src' })
    .pipe(gulp.dest(config.buildRoot));
}

function markup() {
  const hbStream = hb({
    data: config.globs.data,
    helpers: config.globs.helpers,
    partials: config.globs.partials,
    parsePartialName: function(option, file) {
      const split = file.path.split(/\\|\//);
      return split[split.length - 1].replace('.hbs', '');
    },
    bustCache: true,
  });
  hbStream.partials({
    svg_styles: fs.readFileSync(config.buildRoot + '/css/svg.css').toString(),
  });
  if (process.env.GA_PROP) {
    hbStream.data({
      'gaPropertyId': process.env.GA_PROP,
    });
  }
  if (process.env.SENTRY_KEY) {
    hbStream.data({
      'sentryKey': process.env.SENTRY_KEY,
    });
  }
  return gulp.src(config.globs.templates)
    .pipe(frontMatter())
    .pipe(hbStream)
    .on('error', notify.onError())
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest(config.buildRoot));
}

function discard() {
  return deleteSync('build/__discard__');
}

function cleanBuild() {
  return deleteSync('build');
}

function cleanDocs() {
  return deleteSync('docs');
}

function buildFiles(callback) {
  webpack(webpackConfig, function(err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    gutil.log('[webpack]', stats.toString());
    callback();
  });
}

const bundle = gulp.series(buildFiles, discard);
const docs = gulp.series(cleanDocs, docsFiles, docsTOC);
const build = gulp.series(cleanBuild, staticFiles, bundle, markup);
const serve = gulp.parallel(watch, server);

exports.clean = gulp.series(cleanDocs, cleanBuild);
exports.docs = docs;
exports.build = build;
exports.serve = serve;
exports.default = gulp.series(build, docs, serve);
