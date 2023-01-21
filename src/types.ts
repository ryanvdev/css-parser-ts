import StrKits from "strkits";

export interface Declaration {
    property: string;
    value: string;
};

export interface DeclarationBlock {
    [property:string]: string;
};

export interface RuleSet {
    type: 'rule-set';
    selectors: string[];
    declarationBlock: DeclarationBlock;
}

export interface RegularAtRule {
    type: 'regular-at-rule';
    identifier: string;
    rule: string;
}

export interface DescribesAtRule{
    type: 'describes-at-rule';
    identifier: string;
    rule: string;
    declarationBlock: DeclarationBlock;
}

export interface NestedAtRule {
    type: 'nested-at-rule';
    identifier: string;
    rule: string;
    styleSheet: StyleSheet[];
}

export type StyleSheet = RuleSet | RegularAtRule | DescribesAtRule | NestedAtRule;

// ==========================

export interface ParseOptions{
    classOrIDTransformFn?: (oldClassOrID:string) => string;
    propertyTransformFn?: (oldPropertyName:string) => string;
}