// archivo: gulpfile.js
const { src, dest, watch, series, parallel } = require('gulp');
const sass         = require('gulp-sass')(require('sass'));
const autoprefixer = require('autoprefixer');
const postcss      = require('gulp-postcss');
const cssnano      = require('cssnano');
const concat       = require('gulp-concat');
const terser       = require('gulp-terser-js');
const rename       = require('gulp-rename');
const sharp        = require('sharp');
const path         = require('path');
const fs           = require('fs');
const { glob }     = require('fs/promises');

const paths = {
    scss:     'src/scss/**/*.scss',
    js:       'src/js/**/*.js',
    imagenes: 'src/img/**/*.{png,jpg,jpeg,gif,svg}'
};

// Rutas absolutas: evitan problemas entre \ (Windows) y / (Linux)
const ORIGEN_IMG  = path.resolve('src/img');
const DESTINO_IMG = path.resolve('build/img');

// --- CSS ------------------------------------------------
// Sourcemaps nativos de Gulp 5: se activan en src() y se escriben en dest()
function css() {
    return src(paths.scss, { sourcemaps: true })
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(dest('build/css', { sourcemaps: '.' }));
}

// --- JavaScript -----------------------------------------
function javascript() {
    return src(paths.js, { sourcemaps: true })
        .pipe(concat('bundle.js'))
        .pipe(terser())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest('build/js', { sourcemaps: '.' }));
}

// --- Imagenes: optimizar + convertir a WebP con sharp ---
async function imagenes() {
    const archivos = [];
    for await (const archivo of glob('src/img/**/*.{png,jpg,jpeg}')) {
        archivos.push(archivo);
    }

    for (const archivo of archivos) {
        const rutaAbsoluta = path.resolve(archivo);
        const relativa     = path.relative(ORIGEN_IMG, rutaAbsoluta);
        const destino      = path.join(DESTINO_IMG, relativa);
        const destDir      = path.dirname(destino);
        const baseName     = path.basename(archivo, path.extname(archivo));
        const ext          = path.extname(archivo).toLowerCase();

        fs.mkdirSync(destDir, { recursive: true });

        // Un solo formato por archivo segun su extension real
        if (ext === '.jpg' || ext === '.jpeg') {
            await sharp(rutaAbsoluta)
                .jpeg({ quality: 80, progressive: true })
                .toFile(destino);
        } else if (ext === '.png') {
            await sharp(rutaAbsoluta)
                .png({ compressionLevel: 9, palette: true, quality: 80 })
                .toFile(destino);
        }

        await sharp(rutaAbsoluta)
            .webp({ quality: 80 })
            .toFile(path.join(destDir, `${baseName}.webp`));

        console.log(`OK ${relativa}`);
    }
}

// --- SVG y GIF: copiar sin modificar --------------------
// encoding: false -> Gulp 5 lee como texto por defecto y corromperia los GIF
function copiarOtros() {
    return src('src/img/**/*.{svg,gif}', { encoding: false })
        .pipe(dest('build/img'));
}

// --- Watch ----------------------------------------------
function watchArchivos() {
    watch(paths.scss,     css);
    watch(paths.js,       javascript);
    watch(paths.imagenes, series(imagenes, copiarOtros));
}

// --- Tareas publicas ------------------------------------
const build = parallel(css, javascript, series(imagenes, copiarOtros));

exports.css           = css;
exports.javascript    = javascript;
exports.imagenes      = series(imagenes, copiarOtros);
exports.build         = build;
exports.watchArchivos = watchArchivos;
exports.default       = series(build, watchArchivos);
