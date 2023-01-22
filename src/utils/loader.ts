import {Options} from 'prettier';


export type LoadFormatFnReturn =  (source: string, options?: Options|undefined) => string;

let formatFn:LoadFormatFnReturn|undefined = undefined;

export function loadFormatFn():LoadFormatFnReturn {
    if(!formatFn){
        try{
            if(!require.resolve('prettier')){
                throw new Error('');
            }
        }
        catch(e){
            throw new Error('To ensure performance, we did not install "prettier" as a dependency. To fix it: install "prettier": `npm i prettier` (or `yarn add prettier`).');
        }
    
        formatFn = require('prettier').format as LoadFormatFnReturn;
    }

    return formatFn;
}