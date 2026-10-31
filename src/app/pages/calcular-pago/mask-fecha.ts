import { Directive, Attribute, Optional } from '@angular/core';
import { NgModel } from '@angular/forms'

@Directive({
    selector: '[mask-fecha]',
    host: {
        '(input)': 'onInputChange($event)',
    },
    providers: [NgModel],
})
export class MaskFecha {
    pattern: string;

    constructor(
        @Optional() private model: NgModel,
        @Attribute('mask-fecha') pattern: string
    ) {
        this.pattern = pattern;
    }

    onInputChange(event: any) {
        try {
            let value = event.target.value,
                caret = event.target.selectionStart,
                pattern = this.pattern,
                applied = '',
                ordinal = 0;

            if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') {
                // handle backspace and delete keys
                if (value.length) {
                    // remove all trailing formatting
                    while (value.length && pattern[value.length - 1] !== '*') {
                        value = value.substring(0, value.length - 1);
                    }
                }
            } else {
                // handle input
                for (let i = 0; i < value.length; i++) {
                    // enforce pattern limit
                    if (ordinal < pattern.length) {
                        if (value[i].match(/[0-9]/)) {
                            if (pattern[ordinal] === '*') {
                                // Validate the number before "/"
                                if (ordinal === 0 && Number(value[i]) > 1) {
                                    applied += '0'; // Add 0 as the first digit
                                    ordinal++; // move to the next character in the pattern
                                    i--; // repeat this character check with the original digit
                                } else if (ordinal === 1 && value[i - 1] === '0' && Number(value[i]) === 0) {
                                  break; // Stop processing if the number is 0 after the first 0
                              }
                                else if (ordinal === 1 && value[i - 1] === '1' && Number(value[i]) > 2) {
                                    break; // Stop processing if the number is greater than 2 after "1"
                                } else {
                                    applied += value[i];
                                    ordinal++; // move to the next character in the pattern
                                }
                            } else {
                                applied += pattern[ordinal];
                                ordinal++; // move to the next character in the pattern
                                i--; // repeat this character check
                            }
                        }
                    }
                }
            }

            event.target.value = applied;

            if (this.model && this.model.valueAccessor) {
                this.model.valueAccessor.writeValue(applied);
            }

            if (caret < value.length) {
                event.target.setSelectionRange(caret, caret);
            }
        } catch (exception: any) {
            console.error(exception.message);
        }
    }
}
