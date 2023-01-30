import { styleForEach } from './helpful';
import { StrKits } from 'strkits';
import { Range } from './local-types';

export function removeAllComments(subject: string): string {
    const commentRanges: Range[] = [];

    let currentStart: number = 0;

    styleForEach({
        subject,
        eventFn: (e) => {
            switch (e.type) {
                case 'open-comment': {
                    currentStart = e.index;
                    return;
                }
                case 'close-comment': {
                    if (currentStart < 0) {
                        throw new SyntaxError(subject.slice(e.index + 10, e.index - 10));
                    }

                    commentRanges.push({
                        end: e.index + 1,
                        start: currentStart,
                    });

                    currentStart = -1;
                    return;
                }
            }
        },
    });

    if (currentStart >= 0 && commentRanges.length > 0) {
        throw new SyntaxError(subject.slice(currentStart + 10, currentStart - 10));
    }

    if (commentRanges.length === 0) {
        return subject;
    }

    const EMPTY_STRING = '';
    return StrKits.replaceRange(
        subject,
        commentRanges.map((range) => {
            return {
                ...range,
                value: EMPTY_STRING,
            };
        }),
    );
}

export function standardizeStyleSheet(subject: string): string {
    const lineBreakChar = StrKits.getLineBreakChar(subject);

    return removeAllComments(subject)
        .split(lineBreakChar)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join(' ');
}
