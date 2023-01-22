import path from 'path';
import sass from 'sass';
import fs from 'fs';
import * as CSSParser from '../src';
import { transformToCamelCase } from 'strkits';


const inputFilePath = path.join(__dirname, './sample.scss');
const outputFilePath = path.join(__dirname, './sample.output.css');
const outputJsonFilePath = path.join(__dirname, './sample.output.json');
const outputRawFilePath = path.join(__dirname, './sample.raw.css');

const main  = async () => {
    const rawStrCss = sass.compile(inputFilePath).css;

    const css:CSSParser.StyleSheet[] = CSSParser.parse(rawStrCss, {
        classOrIDTransformFn(oldClassOrID) {
            return oldClassOrID + '_new_'
        },
        propertyTransformFn: transformToCamelCase
    });

    const newStrCss:string = CSSParser.toString(css, {
        pretty: true,
        tabWidth: 4,
        printWidth: 120
    });

    // !
    console.dir(css, {
        depth: Infinity
    });

    fs.writeFileSync(outputFilePath, newStrCss, { encoding: 'utf-8' });
    fs.writeFileSync(outputJsonFilePath, JSON.stringify(css, null, 4), { encoding: 'utf-8' });
    fs.writeFileSync(outputRawFilePath, rawStrCss, { encoding: 'utf-8' });
    
    console.log('See ', 'test/sample.output.json');
}

main();