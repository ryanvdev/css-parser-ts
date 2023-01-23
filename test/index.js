const fs = require('node:fs');
const path = require('node:path');

const { transformToCamelCase } = require('strkits');

const CSSParser = require('../lib'); //! REQUIRE: `yarn build` first .

// ! Check if the new library works with native javascript ?

const rawCssFilePath = path.join(__dirname, './sample.raw.css'); //! REQUIRE: `yarn test` first .

const main = async () => {
    const rawStrCss = fs.readFileSync(rawCssFilePath, { encoding: 'utf-8' });

    const result = CSSParser.safeParse(rawStrCss, {
        propertyTransformFn: transformToCamelCase,
    });

    if (result.success) {
        console.dir(result.styleSheetList, { depth: Infinity });
    } else {
        console.error('[ERROR]', result.errorMessage);
    }
};

main();
