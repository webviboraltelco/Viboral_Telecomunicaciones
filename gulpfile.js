// archivo: gulpfile.js
const { src, dest, watch, series, parallel } = require('gulp');
const sass         = require('gulp-sass')(require('sass'));
const autoprefixer = require('autoprefixer');
const postcss      = require('gulp-postcss');
const sourcemaps   = require('gulp-sourcemaps');
const cssnano      = require('cssnano');
const concat       = require('gulp-concat');
const terser       = require('gulp-terser-js');
const rename       = require('gulp-rename');
const sharp        = require('sharp');
const path         = require('path');
const fs           = require('fs');
const { glob } = require('fs/promises');

const paths = {
    scss:     'src/scss/**/*.scss',
    js:       'src/js/**/*.js',
    imagenes: 'src/img/**/*.{png,jpg,jpeg,gif,svg}'
};

// ─── CSS ──────────────────────────────────────────────────────────
function css() {
    return src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('build/css'));
}

// ─── JavaScript ───────────────────────────────────────────────────
function javascript() {
    return src(paths.js)
        .pipe(sourcemaps.init())
        .pipe(concat('bundle.js'))
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest('./build/js'));
}

// ─── Imágenes: optimizar + convertir a WebP con sharp ─────────────
async function imagenes() {
    // glob nativo de Node 22 devuelve AsyncIterator
    const archivos = [];
    for await (const archivo of glob('src/img/**/*.{png,jpg,jpeg}')) {
        archivos.push(archivo);
    }

    for (const archivo of archivos) {
        const destDir  = path.dirname(archivo).replace('src/img', 'build/img');
        const baseName = path.basename(archivo, path.extname(archivo));

        fs.mkdirSync(destDir, { recursive: true });

        await sharp(archivo)
            .jpeg({ quality: 80, progressive: true })
            .png({ compressionLevel: 8 })
            .toFile(path.join(destDir, path.basename(archivo)));

        await sharp(archivo)
            .webp({ quality: 80 })
            .toFile(path.join(destDir, `${baseName}.webp`));

        console.log(`✓ ${archivo}`);
    }
}

// ─── SVG y GIF: copiar sin modificar ──────────────────────────────
function copiarOtros() {
    return src('src/img/**/*.{svg,gif}')
        .pipe(dest('build/img'));
}

// ─── Watch ────────────────────────────────────────────────────────
function watchArchivos() {
    watch(paths.scss,     css);
    watch(paths.js,       javascript);
    watch(paths.imagenes, series(imagenes, copiarOtros));
}

exports.css           = css;
exports.javascript    = javascript;
exports.imagenes      = series(imagenes, copiarOtros);
exports.watchArchivos = watchArchivos;
exports.default       = parallel(css, javascript, series(imagenes, copiarOtros), watchArchivos);