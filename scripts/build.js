#!/usr/bin/env node
/**
 * Minifies each src/*.js into dist/*.min.js with terser. No bundler — these
 * files are meant to be dropped in as plain <script> tags, so the build
 * stays a straight 1:1 minify, not a bundle.
 */
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const SRC_DIR = path.join(__dirname, '..', 'src');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const pkg = require('../package.json');

async function build() {
	fs.mkdirSync(DIST_DIR, { recursive: true });

	const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.js'));

	for (const file of files) {
		const srcPath = path.join(SRC_DIR, file);
		const code = fs.readFileSync(srcPath, 'utf8');

		const result = await minify(code, {
			compress: true,
			mangle: true,
			format: {
				comments: false,
				preamble: `/*! ${pkg.name} v${pkg.version} | ${pkg.license} */`,
			},
		});

		if (result.error) {
			throw result.error;
		}

		const outName = file.replace(/\.js$/, '.min.js');
		const outPath = path.join(DIST_DIR, outName);
		fs.writeFileSync(outPath, result.code);

		const srcSize = Buffer.byteLength(code, 'utf8');
		const outSize = Buffer.byteLength(result.code, 'utf8');
		console.log(`${file} -> dist/${outName} (${srcSize}B -> ${outSize}B)`);
	}
}

build().catch((err) => {
	console.error(err);
	process.exit(1);
});
