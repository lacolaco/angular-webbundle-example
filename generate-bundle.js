const wbn = require('wbn');
const fs = require("fs");
const path = require("path");
const glob = require('glob');
const mime = require('mime');

async function generateBundle(distDir, primaryURL, output) {
    const files = await new Promise(resolve => {
        glob(`${distDir}/*`, (err, files) => {
            resolve(files);
        });
    });
    const builder = new wbn.BundleBuilder(primaryURL);
    files.forEach(file => {
        const url = primaryURL + path.relative(distDir, file);
        builder.addExchange(url, 200, { 'Content-Type': mime.getType(file) }, fs.readFileSync(file));
    });
    builder.addExchange(
        primaryURL, 200, { 'Content-Type': 'text/html' }, fs.readFileSync(`${distDir}/index.html`));
    fs.writeFileSync(path.resolve(distDir, output), builder.createBundle());
};


const angularJson = require('./angular.json');
const project = angularJson.defaultProject ? angularJson.projects[angularJson.defaultProject] : angularJson.projects[0];

generateBundle(project.architect.build.options.outputPath, 'https://example.com/', 'out.wbn');
