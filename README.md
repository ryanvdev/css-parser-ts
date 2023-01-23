# API


## `parse(rawCSS: string, options?: ParseOptions): StyleSheet[]`

### `sample.raw.css`

```css
.header {
    display: block;
    background-color: blue;
    color: aqua;
    --variable: blue;
}
.header > a {
    /* this is a comment 3 */
    display: block;
    border-radius: thin solid black;
    /* this is a comment 2 */
    background-image: url('abc.com');
    --variable: blue;
}
.header > div {
    display: block;
    border-radius: thin solid black;
    background-image: url('abc.com');
}
.header div {
    width: 100px;
    height: 100px;
    background-color: red;
    position: relative;
    animation-name: example;
    animation-duration: 4s;
    animation-iteration-count: 2;
    animation-direction: alternate-reverse;
}
@keyframes example {
    0% {
        background-color: red;
        left: 0px;
        top: 0px;
    }
    25% {
        background-color: yellow;
        left: 200px;
        top: 0px;
    }
    50% {
        background-color: blue;
        left: 200px;
        top: 200px;
    }
    75% {
        background-color: green;
        left: 0px;
        top: 200px;
    }
    100% {
        background-color: red;
        left: 0px;
        top: 0px;
    }
}

/* this is a comment 3 */
#header.header, .f[href="https://exam,le.org?a=a .b .c,e"]:has(div, .a, .b) + #cc.a.b
{
    /* width */
    /* Track */
    /* Handle */
    /* Handle on hover */
}
#header.header > a, .f[href="https://exam,le.org?a=a .b .c,e"]:has(div, .a, .b) + #cc.a.b > a
{
    display: block;
    border-radius: thin solid black;
    background-image: url('abc.com');
}
#header.header ::-webkit-scrollbar, .f[href="https://exam,le.org?a=a .b .c,e"]:has(div, .a, .b) + #cc.a.b ::-webkit-scrollbar
{
    width: 10px;
}
#header.header ::-webkit-scrollbar-track, .f[href="https://exam,le.org?a=a .b .c,e"]:has(div, .a, .b) + #cc.a.b ::-webkit-scrollbar-track
{
    background: #f1f1f1;
}
#header.header ::-webkit-scrollbar-thumb, .f[href="https://exam,le.org?a=a .b .c,e"]:has(div, .a, .b) + #cc.a.b ::-webkit-scrollbar-thumb
{
    background: #888;
}
#header.header ::-webkit-scrollbar-thumb:hover, .f[href="https://exam,le.org?a=a .b .c,e"]:has(div, .a, .b) + #cc.a.b ::-webkit-scrollbar-thumb:hover
{
    background: #555;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
@media screen and (max-width: 100px) {
    .test-media {
        display: block;
        background-color: blue;
        border-top: thin solid black;
        border-left: 2px dotted blue;
        border-bottom: 3px solid black;
    }
}
@layer utilities {
    .padding-sm {
        padding: 0.5rem;
    }
    .padding-lg {
        padding: 0.8rem;
    }
}

```


### `index.ts`

```ts
import { transformToCamelCase, transformToSnakeCase } from 'strkits';
import * as CssKits from 'css-kits';

// read file
const rawCssFilePath = path.join(__dirname, './sample.raw.css');
const rawStrCss:string = fs.readFileSync(rawCssFilePath, { encoding: 'utf-8' });


// parse
const css: CssKits.StyleSheet[] = CssKits.parse(rawStrCss, {
    classOrIDTransformFn(oldClassOrID) {
        return oldClassOrID + '_new_';
    },
    propertyTransformFn: transformToCamelCase,
});


// print
if (result.success) {
    console.dir(result.styleSheetList, { depth: Infinity });
} else {
    console.error('[ERROR]', result.errorMessage);
}

```


### Output
```json
[
    {
        "type": "rule-set",
        "selectors": [".header_new_"],
        "declarationBlock": {
            "display": "block",
            "backgroundColor": "blue",
            "color": "aqua",
            "--variable": "blue"
        }
    },
    {
        "type": "rule-set",
        "selectors": [".header_new_ > a"],
        "declarationBlock": {
            "display": "block",
            "borderRadius": "thin solid black",
            "backgroundImage": "url(\"abc.com\")",
            "--variable": "blue"
        }
    },
    {
        "type": "rule-set",
        "selectors": [".header_new_ > div"],
        "declarationBlock": {
            "display": "block",
            "borderRadius": "thin solid black",
            "backgroundImage": "url(\"abc.com\")"
        }
    },
    {
        "type": "rule-set",
        "selectors": [".header_new_ div"],
        "declarationBlock": {
            "width": "100px",
            "height": "100px",
            "backgroundColor": "red",
            "position": "relative",
            "animationName": "example",
            "animationDuration": "4s",
            "animationIterationCount": "2",
            "animationDirection": "alternate-reverse"
        }
    },
    {
        "type": "nested-at-rule",
        "identifier": "keyframes",
        "rule": "example",
        "styleSheetList": [
            {
                "type": "rule-set",
                "selectors": ["0%"],
                "declarationBlock": {
                    "backgroundColor": "red",
                    "left": "0px",
                    "top": "0px"
                }
            },
            {
                "type": "rule-set",
                "selectors": ["25%"],
                "declarationBlock": {
                    "backgroundColor": "yellow",
                    "left": "200px",
                    "top": "0px"
                }
            },
            {
                "type": "rule-set",
                "selectors": ["50%"],
                "declarationBlock": {
                    "backgroundColor": "blue",
                    "left": "200px",
                    "top": "200px"
                }
            },
            {
                "type": "rule-set",
                "selectors": ["75%"],
                "declarationBlock": {
                    "backgroundColor": "green",
                    "left": "0px",
                    "top": "200px"
                }
            },
            {
                "type": "rule-set",
                "selectors": ["100%"],
                "declarationBlock": {
                    "backgroundColor": "red",
                    "left": "0px",
                    "top": "0px"
                }
            }
        ]
    },
    {
        "type": "rule-set",
        "selectors": [
            "#header_new_.header_new_",
            ".f_new_[href=\"https://exam,le.org?a=a .b .c,e\"]:has(div, .a_new_, .b_new_) + #cc_new_.a_new_.b_new_"
        ],
        "declarationBlock": {}
    },
    {
        "type": "rule-set",
        "selectors": [
            "#header_new_.header_new_ > a",
            ".f_new_[href=\"https://exam,le.org?a=a .b .c,e\"]:has(div, .a_new_, .b_new_) + #cc_new_.a_new_.b_new_ > a"
        ],
        "declarationBlock": {
            "display": "block",
            "borderRadius": "thin solid black",
            "backgroundImage": "url(\"abc.com\")"
        }
    },
    {
        "type": "rule-set",
        "selectors": [
            "#header_new_.header_new_ ::-webkit-scrollbar",
            ".f_new_[href=\"https://exam,le.org?a=a .b .c,e\"]:has(div, .a_new_, .b_new_) + #cc_new_.a_new_.b_new_ ::-webkit-scrollbar"
        ],
        "declarationBlock": {
            "width": "10px"
        }
    },
    {
        "type": "rule-set",
        "selectors": [
            "#header_new_.header_new_ ::-webkit-scrollbar-track",
            ".f_new_[href=\"https://exam,le.org?a=a .b .c,e\"]:has(div, .a_new_, .b_new_) + #cc_new_.a_new_.b_new_ ::-webkit-scrollbar-track"
        ],
        "declarationBlock": {
            "background": "#f1f1f1"
        }
    },
    {
        "type": "rule-set",
        "selectors": [
            "#header_new_.header_new_ ::-webkit-scrollbar-thumb",
            ".f_new_[href=\"https://exam,le.org?a=a .b .c,e\"]:has(div, .a_new_, .b_new_) + #cc_new_.a_new_.b_new_ ::-webkit-scrollbar-thumb"
        ],
        "declarationBlock": {
            "background": "#888"
        }
    },
    {
        "type": "rule-set",
        "selectors": [
            "#header_new_.header_new_ ::-webkit-scrollbar-thumb:hover",
            ".f_new_[href=\"https://exam,le.org?a=a .b .c,e\"]:has(div, .a_new_, .b_new_) + #cc_new_.a_new_.b_new_ ::-webkit-scrollbar-thumb:hover"
        ],
        "declarationBlock": {
            "background": "#555"
        }
    },
    {
        "type": "nested-at-rule",
        "identifier": "keyframes",
        "rule": "spin",
        "styleSheetList": [
            {
                "type": "rule-set",
                "selectors": ["from"],
                "declarationBlock": {
                    "transform": "rotate(0deg)"
                }
            },
            {
                "type": "rule-set",
                "selectors": ["to"],
                "declarationBlock": {
                    "transform": "rotate(360deg)"
                }
            }
        ]
    },
    {
        "type": "nested-at-rule",
        "identifier": "media",
        "rule": "screen and (max-width: 100px)",
        "styleSheetList": [
            {
                "type": "rule-set",
                "selectors": [".test-media_new_"],
                "declarationBlock": {
                    "display": "block",
                    "backgroundColor": "blue",
                    "borderTop": "thin solid black",
                    "borderLeft": "2px dotted blue",
                    "borderBottom": "3px solid black"
                }
            }
        ]
    },
    {
        "type": "nested-at-rule",
        "identifier": "layer",
        "rule": "utilities",
        "styleSheetList": [
            {
                "type": "rule-set",
                "selectors": [".padding-sm_new_"],
                "declarationBlock": {
                    "padding": "0.5rem"
                }
            },
            {
                "type": "rule-set",
                "selectors": [".padding-lg_new_"],
                "declarationBlock": {
                    "padding": "0.8rem"
                }
            }
        ]
    }
]
```