import { StyleSheet } from '../types';

export function mkResult<T>(callbackFn: () => T): T {
    return callbackFn();
}

export interface StyleForEachEventData {
    type: 'open-comment' | 'close-comment' | 'open-string' | 'close-string';
    value: string;
    index: number;
    breakForEach: () => void;
}

export type StyleForEachCallback = (e: {
    value: string;
    index: number;
    breakForEach: () => void;
}) => void;

export interface StyleForEachProps {
    subject: string;
    callbackFn?: StyleForEachCallback;
    eventFn?: (e: StyleForEachEventData) => void;
}

/**
 * forEach ignore string and comment
 */
export function styleForEach(props: StyleForEachProps) {
    const { subject } = props;
    let beingInsideOfComment: boolean = false;
    let currentStringMark: string | undefined = undefined;
    let isBreakForEach: boolean = false;

    const dispatchCallback = mkResult<StyleForEachCallback>(() => {
        if (props.callbackFn) return props.callbackFn;
        return (e) => {
            return;
        };
    });

    const dispatchEvent = mkResult<(e: StyleForEachEventData) => any>(() => {
        if (props.eventFn) return props.eventFn;
        return (e) => {
            return;
        };
    });

    const breakForEach = () => {
        isBreakForEach = true;
    };

    for (let i = 0; i < subject.length; i++) {
        if (isBreakForEach) return;
        const currentLetter = subject[i];

        switch (currentLetter) {
            case '\r':
            case '\n': {
                continue;
            }

            //! string
            case '"':
            case "'": {
                // inside of comment
                if (beingInsideOfComment) continue;

                // start of the string
                if (currentStringMark === undefined) {
                    currentStringMark = currentLetter;
                    dispatchEvent({
                        type: 'open-string',
                        index: i,
                        value: currentLetter,
                        breakForEach,
                    });
                    continue;
                }

                // end of the string
                if (currentStringMark === currentLetter) {
                    currentStringMark = undefined;
                    dispatchEvent({
                        type: 'close-string',
                        index: i,
                        value: currentLetter,
                        breakForEach,
                    });
                    continue;
                }

                // inside of the string
                continue;
            }
            case '/': {
                // Being inside of string
                if (currentStringMark !== undefined) {
                    continue;
                }

                // inside of comment
                if (beingInsideOfComment) {
                    // close comment
                    if (subject.charAt(i - 1) === '*') {
                        beingInsideOfComment = false;
                        dispatchEvent({
                            type: 'close-comment',
                            index: i,
                            value: currentLetter,
                            breakForEach,
                        });
                        continue;
                    }
                    continue;
                }

                // outside of comment

                // open comment
                if (subject.charAt(i + 1) === '*') {
                    beingInsideOfComment = true;
                    dispatchEvent({
                        type: 'open-comment',
                        index: i,
                        value: currentLetter,
                        breakForEach,
                    });
                    continue;
                }
                continue;
            }
            default: {
                // Being Inside of string or inside of comment.
                if (currentStringMark !== undefined || beingInsideOfComment) {
                    continue;
                }
            }
        }

        dispatchCallback({
            breakForEach,
            index: i,
            value: currentLetter,
        });
    }
}

export type SelectorsMapCallbackFn = (selector: string) => string;
export function selectorsMap(
    styleSheetList: StyleSheet[],
    callbackFn: SelectorsMapCallbackFn,
    clone: boolean = true,
) {
    const styleSheetListCopy = mkResult(() => {
        if (clone) {
            return structuredClone(styleSheetList);
        }
        return styleSheetList;
    });

    styleSheetListCopy.forEach((item) => {
        switch (item.type) {
            case 'rule-set': {
                item.selectors = item.selectors.map(callbackFn);
                return;
            }
            case 'nested-at-rule': {
                selectorsMap(item.styleSheetList, callbackFn, false);
                return;
            }
            default: {
                return;
            }
        }
    });

    return styleSheetListCopy;
}
