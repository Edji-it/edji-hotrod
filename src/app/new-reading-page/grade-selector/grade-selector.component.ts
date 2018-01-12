import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GradeSelector),
    multi: true
};

@Component({
    selector: 'grade-selector',
    templateUrl:'grade-selector.component.pug',
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class GradeSelector implements ControlValueAccessor {

    //The internal data model
    private gradeSelection: number[] = [];

    // Form reference values
    private gradeInitials: string[] = ['K','1','2','3','4','5','6','7','8','9','10','11','12','U']
    private gradeNames: string[] = [
        'Kindergarten',
        '1st Grade',
        '2nd Grade',
        '3rd Grade',
        '4th Grade',
        '5th Grade',
        '6th Grade',
        '7th Grade',
        '8th Grade',
        '9th Grade',
        '10th Grade',
        '11th Grade',
        '12th Grade',
        'University/College'
    ]

    private selectGrade(gradeIndex: number): void {
        if (this.gradeSelection.length == 1) {
            let min = Math.min(...this.gradeSelection)
            let max = Math.max(...this.gradeSelection)
            if (gradeIndex < min) {
                for (let i = gradeIndex; i < min; i++) {
                    this.gradeSelection.push(i)
                } 
            } else if (gradeIndex > max) {
                for (let i = gradeIndex; i > max; i--) {
                    this.gradeSelection.push(i)
                } 
            }
        } else {
            this.gradeSelection = [gradeIndex]
        }
    }

    //Placeholders for the callbacks which are later provided
    //by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    //get accessor
    get value(): any {
        return this.gradeSelection;
    };

    //set accessor including call the onchange callback
    set value(v: any) {
        if (v !== this.gradeSelection && v !== null) {
            this.gradeSelection = v;
            this.onChangeCallback(v);
        }
    }

    //Set touched on blur
    onBlur() {
        this.onTouchedCallback();
    }

    //From ControlValueAccessor interface
    writeValue(value: any) {
        if (value !== this.gradeSelection && value !== null) {
            this.gradeSelection = value;
        }
    }

    //From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

}
