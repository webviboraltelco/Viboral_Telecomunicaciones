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
        const ext      = path.extname(archivo).toLowerCase();

        fs.mkdirSync(destDir, { recursive: true });

        // ✅ FIX: aplicar SOLO el formato correspondiente a la extensión real,
        // en vez de encadenar .jpeg() y .png() (el segundo sobreescribía
        // el formato de salida del primero, causando que los .jpg/.jpeg
        // se guardaran como PNG sin comprimir, 10-25x más pesados)
        if (ext === '.jpg' || ext === '.jpeg') {
            await sharp(archivo)
                .jpeg({ quality: 80, progressive: true })
                .toFile(path.join(destDir, path.basename(archivo)));
        } else if (ext === '.png') {
            // palette: true activa cuantización de color (similar a pngquant),
            // reduce mucho más el peso en fotos guardadas como PNG.
            // Si alguna imagen se ve con banding/dithering notorio, ese
            // archivo puntual es candidato a migrarse a .jpg en su lugar.
            await sharp(archivo)
                .png({ compressionLevel: 9, palette: true, quality: 80 })
                .toFile(path.join(destDir, path.basename(archivo)));
        }

        // El .webp sí estaba bien — un solo formato, sin conflicto
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