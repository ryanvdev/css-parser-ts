const listRegularAtRule = Object.freeze(['charset', 'import', 'namespace']);
const listNestedAtRule = Object.freeze(['media', 'supports', 'document', 'keyframes', 'layer']);

export function typeOfAtRule(identifier: string) {
    if (listRegularAtRule.includes(identifier)) return 'regular';
    if (listNestedAtRule.includes(identifier)) return 'nested';
    return 'describes';
}

export function typeOfStyleBlock(subject: string) {
    if (subject.startsWith('@')) return 'at-rule';
    return 'rule-set';
}
