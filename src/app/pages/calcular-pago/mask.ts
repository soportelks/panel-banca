import { Directive, Attribute, Optional } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[mask]',
  host: {
    '(input)': 'onInputChange($event)',
  },
  providers: [NgModel],
})
export class Mask {
  pattern: string;

  constructor(
    @Optional() private model: NgModel,
    @Attribute('mask') pattern: string
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

      if (
        event.inputType === 'deleteContentBackward' ||
        event.inputType === 'deleteContentForward'
      ) {
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
                applied += value[i];
                ordinal++; // move to the next character in the pattern
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
