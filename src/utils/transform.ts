import StrKits from 'strkits';
import { StyleSheet } from '../types';
import { detectAllClassAndId } from './detector';
import { selectorsMap } from './helpful';

export type TransformClassAndIDTransformFunc = (classOrID: string) => string;
export function transformClassAndID(
    styleSheetList: StyleSheet[],
    transformFunc: TransformClassAndIDTransformFunc,
) {
    const classOrIDList: {
        [k: string]: string;
    } = {};

    const transform = (oldClassOrID: string): string => {
        if (oldClassOrID in classOrIDList === false) {
            classOrIDList[oldClassOrID] = transformFunc(oldClassOrID);
        }

        return classOrIDList[oldClassOrID];
    };

    const newStyleSheetList = selectorsMap(styleSheetList, (selector) => {
        return StrKits.replaceRange(
            selector,
            detectAllClassAndId(selector).map(({ start, end }) => {
                return {
                    start,
                    end,
                    value: transform(selector.slice(start, end)),
                };
            }),
        );
    });

    return {
        newStyleSheetList,
        classOrIDList,
    };
}
