import { StrKits } from 'strkits';

import {
    DeclarationBlock,
    DescribesAtRule,
    NestedAtRule,
    ParseOptions,
    RegularAtRule,
    RuleSet,
    StyleSheet,
} from '../types';
import * as Splitter from './splitter';
import * as Checker from './checker';
import * as Preprocessing from './pre-processing';
import { detectAllClassAndId } from './detector';

function parseSelectors(subject: string, transformFunc?: (v: string) => string): string[] {
    let selectors: string[] = Splitter.splitSelectors(subject);

    if (!transformFunc) return selectors;

    return selectors.map((selector) => {
        return StrKits.replaceRange(
            selector,
            detectAllClassAndId(selector).map(({ start, end }) => {
                return {
                    start,
                    end,
                    value: transformFunc(selector.slice(start, end)),
                };
            }),
        );
    });
}

/**
 *
 * @param subject look like "{ display: block; background-color: blue; color: aqua; }""
 * @param camelCasePropertyName default true
 */
function parseDeclarationBlock(
    subject: string,
    transformFunc?: (v: string) => string,
): DeclarationBlock {
    const results: DeclarationBlock = {};

    Splitter.splitDeclarationBlock(subject).forEach((item) => {
        const firstIndexOfColon = item.indexOf(':');

        if (firstIndexOfColon <= 0) {
            throw new SyntaxError(item);
        }

        let property = item.slice(0, firstIndexOfColon).trim();
        const value = item.slice(firstIndexOfColon + 1).trim();

        if (property.length === 0 || value.length === 0) {
            throw new SyntaxError(item);
        }

        if (transformFunc && property.startsWith('--') === false) {
            property = transformFunc(property);
        }

        results[property] = value;
    });

    return results;
}

/**
 *
 * @param subject look like ".header { display: block; background-color: blue; color: aqua; }"
 */
function parseRuleSet(subject: string, options: ParseOptions): RuleSet {
    const [strSelectors, strDeclarationBlock] = Splitter.splitRuleSetBlock(subject);

    const result: RuleSet = {
        type: 'rule-set',
        selectors: parseSelectors(strSelectors, options.classOrIDTransformFn),
        declarationBlock: parseDeclarationBlock(strDeclarationBlock, options.propertyTransformFn),
    };

    return result;
}

function parseAtRule(
    subject: string,
    options: ParseOptions,
): RegularAtRule | DescribesAtRule | NestedAtRule {
    const { identifier, rule, block } = Splitter.splitAtRuleBlock(subject);

    switch (Checker.typeOfAtRule(identifier)) {
        case 'regular': {
            if (block !== null) {
                throw new SyntaxError(subject);
            }
            return {
                type: 'regular-at-rule',
                identifier,
                rule,
            };
        }
        case 'describes': {
            if (block === null || !(block.startsWith('{') && block.endsWith('}'))) {
                throw new SyntaxError(subject);
            }

            return {
                type: 'describes-at-rule',
                identifier,
                rule,
                declarationBlock: parseDeclarationBlock(block, options.propertyTransformFn),
            };
        }
        case 'nested': {
            if (block === null || !(block.startsWith('{') && block.endsWith('}'))) {
                throw new SyntaxError(subject);
            }

            const standardStyleSheet = block.slice(1, -1).trim();

            return {
                type: 'nested-at-rule',
                identifier,
                rule,
                styleSheetList: parseStyleSheetList(standardStyleSheet, options),
            };
        }
        default: {
            throw new SyntaxError(subject);
        }
    }
}

function parseStyleSheet(standardStyleSheet: string, options: ParseOptions): StyleSheet {
    if (standardStyleSheet.startsWith('@')) {
        return parseAtRule(standardStyleSheet, options);
    }

    return parseRuleSet(standardStyleSheet, options);
}

function parseStyleSheetList(standardStyleSheetList: string, options: ParseOptions): StyleSheet[] {
    if (standardStyleSheetList.length === 0) return [];

    const results: StyleSheet[] = [];

    Splitter.splitIntoBlocks(standardStyleSheetList).forEach(({ start, end }) => {
        const block = standardStyleSheetList.slice(start, end).trim();

        if (block.length === 0 || block === ';') {
            return;
        }

        results.push(parseStyleSheet(block, options));
    });

    return results;
}

export function parse(rawCSS: string, options?: ParseOptions): StyleSheet[] {
    const finalOptions: ParseOptions = {
        ...options,
    };

    const standardStyleSheet: string = Preprocessing.standardizeStyleSheet(rawCSS);
    return parseStyleSheetList(standardStyleSheet, finalOptions);
}

export type SafeParseReturn =
    | {
          success: false;
          errorMessage: string;
      }
    | {
          success: true;
          styleSheetList: StyleSheet[];
      };

export function safeParse(rawCSS: string, options?: ParseOptions): SafeParseReturn {
    try {
        const styleSheetList = parse(rawCSS, options);
        return {
            success: true,
            styleSheetList,
        };
    } catch (e) {
        let errorMessage: string = '';

        if (e instanceof Error) {
            errorMessage = `[${e.name}] ${e.message}`;
        }
        return {
            success: false,
            errorMessage,
        };
    }
}
