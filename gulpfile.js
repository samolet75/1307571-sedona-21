const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const htmnmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify-es");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const gulpWebp = require("gulp-webp");
const del = require("del");
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(rename("styles.min.css"))
    .pipe(gulp.dest("dist/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

//HTML

const html = () => {
  return gulp.src("source/*.html")
  .pipe(htmnmin({collapseWhitespace:true}))
  .pipe(gulp.dest("dist"))
}

//Scripts
const scripts = () => {
  return gulp.src("source/js/script.js")
  .pipe(uglify())
  .pipe(rename("script.min.js"))
  .pipe(gulp.dest("dist/js"))
  .pipe(sync.stream());
}

exports.scripts = scripts;

//Copy

const copy = () => {
return gulp.src([
  "source/fonts/*.{woff2,woff}",
  "source/*.ico",
  "source/img/**/*.{jpg,png,svg}"
],
  {
  base: "source"
})

.pipe(gulp.dest("dist"))

}

exports.copy = copy;

//Clean
const clean = () => {
  return del("dist");
}



// Images
const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({progressive:true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("dist/img"))
}
exports.images = images;

//Webp

const createWebp = () => {
return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(webp({qulity:90}))
  .pipe(gulp.dest("dist/img"))
}

exports.createWebp = createWebp;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'dist'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series(html, sync.reload));
}

//Build
const build = gulp.series(
clean,
  gulp.parallel(
  styles,
  html,
  scripts,
  copy,
  images,
  createWebp
  )
)

exports.build = build;


exports.default = gulp.series(
  clean,
    gulp.parallel(
    styles,
    html,
    scripts,
    copy,
    createWebp
  ),
  gulp.series(
  server, watcher
  )
)
