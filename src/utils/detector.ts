import { styleForEach } from "./helpful";
import { Range } from "./local-types";

const latterOfNameRegEx = /^[a-zA-Z0-9\_\-]$/;

type SelectorTypes = 'class'|'id'|null;
export function detectAllClassAndId(subject:string) {
    const results:Range[] = [];
    
    const currentState:{
        startIndex: number;
        type:SelectorTypes;
    } = {
        startIndex: -1,
        type: null
    }

    const pushRange = (newSelectorType: SelectorTypes, index:number) => {
        if(currentState.type !== null){
            if(currentState.startIndex < 0){
                throw new Error('An unknown error !' + index);
            }

            results.push({
                start: currentState.startIndex,
                end: index
            });
        }

        if(newSelectorType === null){
            currentState.startIndex = -1;
        }
        else{
            currentState.startIndex = index;
        }

        currentState.type = newSelectorType;
    }
    
    styleForEach({
        subject,
        callbackFn: (e) => {
            switch(e.value){
                case '.': {
                    pushRange('class', e.index);
                    return;
                }
                case '#': {
                    pushRange('id', e.index);
                    return;
                }
                default:{
                    if(currentState.type === null) return;
                    if(latterOfNameRegEx.test(e.value)) return;

                    pushRange(null, e.index);
                    return;
                }
            }
        }
    });

    if(currentState.type !== null){
        pushRange(null, subject.length);
    }

    return results;
}