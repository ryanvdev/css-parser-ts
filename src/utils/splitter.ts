import { Range } from './local-types';
import { styleForEach } from './helpful';

function findFirstIndexOfOpenBrace(subject: string): number | null {
    let result: number | null = null;

    styleForEach({
        subject,
        callbackFn: (e) => {
            if (e.value === '{') {
                result = e.index;
                e.breakForEach();
            }
        },
    });

    return result;
}

export function splitIntoBlocks(subject: string): Range[] {
    const result: Range[] = [];
    let deep: number = 0;
    let lastIndex: number = 0;
    let isInsideOfAtRule: boolean = false;

    const resultPush = (index: number) => {
        result.push({
            start: lastIndex,
            end: index + 1,
        });

        lastIndex = index + 1;
        isInsideOfAtRule = false;
    };

    styleForEach({
        subject,
        callbackFn: ({ index: i, value: currentLetter }) => {
            switch (currentLetter) {
                case '{': {
                    deep++;
                    return;
                }
                case '}': {
                    deep--;
                    if (deep > 0) return;

                    if (deep === 0) {
                        resultPush(i);
                        return;
                    }

                    throw new SyntaxError(subject.slice(i - 10, i + 10));
                }
                case '@': {
                    if (deep > 0) return;

                    if (isInsideOfAtRule === false) {
                        isInsideOfAtRule = true;
                        return;
                    }

                    throw new SyntaxError(
                        `Syntax is error at ${i}. "${subject.substring(i - 5, 10)}"`,
                    );
                }
                case ';': {
                    if (deep > 0) return;

                    resultPush(i);
                    return;
                }
            }
        },
    });

    return result;
}

/**
 *
 * @param subject look like ".header { display: block; background-color: blue; color: aqua; }"
 * @returns [selectors, block];
 */
export function splitRuleSetBlock(subject: string): [string, string] {
    const indexOfOpenBrace = findFirstIndexOfOpenBrace(subject);

    if (!indexOfOpenBrace || indexOfOpenBrace === 0 || indexOfOpenBrace === subject.length - 1) {
        throw new SyntaxError(subject);
    }

    const selectors = subject.slice(0, indexOfOpenBrace).trim();
    if (selectors.length === 0) {
        throw new SyntaxError(subject.slice(0, 30));
    }

    const block = subject.slice(indexOfOpenBrace).trim();
    return [selectors, block];
}

export function splitDeclarationBlock(subject: string): string[] {
    if (!subject.startsWith('{') || !subject.endsWith('}')) {
        throw new SyntaxError(subject);
    }

    const standardSubject = subject.slice(1, -1).trim();

    const results: string[] = [];
    let hasColon: boolean = false;
    let allOkays: boolean = true;
    let lastIndex: number = 0;

    styleForEach({
        subject: standardSubject,
        callbackFn: (e) => {
            switch (e.value) {
                case ':': {
                    hasColon = true;
                    return;
                }
                case ';': {
                    if (!hasColon) {
                        allOkays = false;
                        e.breakForEach();
                        return;
                    }

                    results.push(standardSubject.slice(lastIndex, e.index));

                    lastIndex = e.index + 1;
                    hasColon = false;
                    return;
                }
            }
        },
    });

    if (!allOkays) {
        throw new SyntaxError(subject);
    }

    if (lastIndex < standardSubject.length) {
        if (!hasColon) {
            allOkays = false;
            throw new SyntaxError(subject);
        }

        results.push(standardSubject.slice(lastIndex, standardSubject.length));
    }

    return results.map((item) => item.trim());
}

export function splitSelectors(subject: string): string[] {
    const ranges: Range[] = [];

    let lastIndex: number = 0;
    let attributeDeep: number = 0;
    let functionDeep: number = 0;

    const pushRange = (index: number) => {
        ranges.push({
            start: lastIndex,
            end: index,
        });

        lastIndex = index + 1;
    };

    styleForEach({
        subject,
        callbackFn: ({ value: currentLetter, index: i }) => {
            switch (currentLetter) {
                case ',': {
                    if (attributeDeep > 0 || functionDeep > 0) return;
                    return pushRange(i);
                }
                case '(': {
                    if (attributeDeep > 0) return;
                    functionDeep += 1;
                    return;
                }
                case ')': {
                    if (attributeDeep > 0) return;
                    functionDeep -= 1;
                    if (functionDeep < 0) {
                        throw new SyntaxError(
                            `Extra characters after close-brace "${subject.substring(i - 5, 20)}"`,
                        );
                    }
                    return;
                }
                case '[': {
                    attributeDeep += 1;
                    return;
                }
                case ']': {
                    attributeDeep -= 1;
                    if (attributeDeep < 0) {
                        throw new SyntaxError(
                            `Extra characters after close-bracket "${subject.substring(
                                i - 5,
                                20,
                            )}"`,
                        );
                    }
                    return;
                }
            }
        },
    });

    if (lastIndex < subject.length) {
        pushRange(subject.length);
    }

    const result: string[] = [];

    ranges.forEach(({ start, end }) => {
        if (end <= start) return;
        const tmp = subject.slice(start, end).trim();

        if (tmp.length === 0) return;
        result.push(tmp);
    });

    return result;
}

export interface SplitAtRuleBlockReturn {
    identifier: string;
    rule: string;
    block: string | null;
}

/**
 *
 * @param subject It look like "@media screen and (max-width: 100px) { .test-media { display: block; background-color: blue; } }"
 */
export function splitAtRuleBlock(subject: string): SplitAtRuleBlockReturn {
    if (subject.length === 0) {
        throw new SyntaxError('Empty string');
    }

    if (!subject.startsWith('@')) {
        throw new SyntaxError(`${subject}`);
    }

    const lastCharacter = subject[subject.length - 1];
    if (!(lastCharacter === ';' || lastCharacter === '}')) {
        throw new SyntaxError(`${subject}`);
    }

    const firstIndexOfSpace = subject.indexOf(' ');

    const identifier = subject.slice(1, firstIndexOfSpace).trim();
    if (identifier.length === 0) {
        throw new SyntaxError(`${subject}`);
    }

    const rest = subject.slice(firstIndexOfSpace).trim();
    if (rest.length === 0) {
        throw new SyntaxError(`${subject}`);
    }

    const result: SplitAtRuleBlockReturn = {
        identifier,
        rule: '',
        block: null,
    };

    switch (lastCharacter) {
        case ';': {
            result.rule = rest.slice(0, -1).trim();
            result.block = null;
            break;
        }
        case '}': {
            const firstIndexOfOpenBrace = findFirstIndexOfOpenBrace(rest);
            if (!firstIndexOfOpenBrace || firstIndexOfOpenBrace === 0) {
                throw new SyntaxError(`${subject}`);
            }

            result.rule = rest.slice(0, firstIndexOfOpenBrace).trim();
            result.block = rest.slice(firstIndexOfOpenBrace).trim();
            break;
        }
        default: {
            throw new SyntaxError(`${subject}`);
        }
    }

    if (result.rule.length === 0) {
        throw new SyntaxError(`${subject}`);
    }

    return result;
}
