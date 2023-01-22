import { transformToKebabCase } from 'strkits';
import { AtRule, DeclarationBlock, RuleSet, StyleSheet, ToStringOptions } from '../types';
import { loadFormatFn } from './loader';

function declarationBlockToString(subject: DeclarationBlock): string {
    const aggregate: string[] = [];

    for (const property in subject) {
        // if not a css variable
        if (property.startsWith('--')) {
            aggregate.push(`${property}: ${subject[property]}`);
        } else {
            aggregate.push(`${transformToKebabCase(property)}: ${subject[property]}`);
        }
    }

    if (aggregate.length === 0) return '{ }';
    return `{ ${aggregate.join('; ')}; }`;
}

function selectorsToString(subjects: string[]): string {
    return subjects.join(', ');
}

function concatRuleSet(subject: RuleSet, aggregate: string[]): string[] {
    if (Object.keys(subject.declarationBlock).length === 0) {
        return aggregate;
    }

    aggregate.push(selectorsToString(subject.selectors));
    aggregate.push(declarationBlockToString(subject.declarationBlock));
    return aggregate;
}

function concatAtRule(subject: AtRule, aggregate: string[]): string[] {
    const firstPart = `@${subject.identifier} ${subject.rule}`;
    aggregate.push(firstPart);

    switch (subject.type) {
        case 'regular-at-rule': {
            aggregate.push(';');
            break;
        }
        case 'describes-at-rule': {
            aggregate.push(declarationBlockToString(subject.declarationBlock));
            break;
        }
        case 'nested-at-rule': {
            aggregate.push('{');
            concatStyleSheetList(subject.styleSheetList, aggregate);
            aggregate.push('}');
            break;
        }
        default: {
            throw new Error('Invalid at-rule type');
        }
    }

    return aggregate;
}

function concatStyleSheet(subject: StyleSheet, aggregate: string[]): string[] {
    switch (subject.type) {
        case 'rule-set': {
            concatRuleSet(subject, aggregate);
            break;
        }
        case 'regular-at-rule':
        case 'describes-at-rule':
        case 'nested-at-rule': {
            concatAtRule(subject, aggregate);
            break;
        }
        default: {
            throw new Error('Invalid style sheet type');
        }
    }

    return aggregate;
}

function concatStyleSheetList(subject: StyleSheet[], aggregate: string[]): string[] {
    for (const styleSheet of subject) {
        concatStyleSheet(styleSheet, aggregate);
    }

    return aggregate;
}

export function toString(subject: StyleSheet[], options?: ToStringOptions): string {
    const results: string[] = [];
    concatStyleSheetList(subject, results);
    let strCss = results.join(' ');

    if (!options) {
        return strCss;
    }

    if(options.pretty === true) {
        const formatFn = loadFormatFn();

        strCss = formatFn(strCss, {
            parser: 'css',
            semi: true,
            tabWidth: options.tabWidth,
            printWidth: options.printWidth,
        });
    }

    return strCss;
}
