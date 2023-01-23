import path from 'path';
import sass from 'sass';
import fs from 'fs';
import * as CssKits from '../src';
import { transformToCamelCase, transformToSnakeCase } from 'strkits';

const inputFilePath = path.join(__dirname, './sample.scss');
const outputFilePath = path.join(__dirname, './sample.output.css');
const outputJsonFilePath = path.join(__dirname, './sample.output.json');
const outputRawFilePath = path.join(__dirname, './sample.raw.css');

const main = async () => {
    const rawStrCss = sass.compile(inputFilePath).css;

    const css: CssKits.StyleSheet[] = CssKits.parse(rawStrCss, {
        classOrIDTransformFn(oldClassOrID) {
            return oldClassOrID + '_new_';
        },
        propertyTransformFn: transformToCamelCase,
    });

    const newStrCss: string = CssKits.toString(css, {
        pretty: true,
        tabWidth: 4,
        printWidth: 120,
    });

    // !
    console.dir(css, {
        depth: Infinity,
    });

    fs.writeFileSync(outputFilePath, newStrCss, { encoding: 'utf-8' });
    fs.writeFileSync(outputJsonFilePath, JSON.stringify(css, null, 4), { encoding: 'utf-8' });
    fs.writeFileSync(outputRawFilePath, rawStrCss, { encoding: 'utf-8' });

    console.log('See ', 'test/sample.output.json');
};

main();
