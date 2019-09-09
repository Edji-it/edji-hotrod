import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { fromEvent } from "rxjs";
import { debounceTime, map } from "rxjs/operators";
import { AuthService } from "src/app/_services";


@Component({
    selector: 'hot-school-selector',
    templateUrl: './school-selector.component.pug',
    styleUrls: ['./school-selector.component.scss'],
})
export class SchoolSelectorComponent implements OnInit, AfterViewInit {

    @Input() formControlAlias: FormControl

    @ViewChild('schoolInput', { static: false }) input: ElementRef

    public schools: any[]
    public schoolSuggestShow: boolean
    public schoolInfo: {
        school_name: string
        school_id: string
        district_name: string
        district_id: string
    } = {
            school_name: '',
            school_id: '',
            district_name: '',
            district_id: '',
        }

    constructor(private _auth: AuthService) {

    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        // initialize keyup binding
        this.searchOnTypeInIt()
    }

    /**
   * Set up a keyup event, but debounce the input so we don't bombard our search client with a new search for each keystroke
   */
    private searchOnTypeInIt(): void {
        setTimeout(() => {
            const keyUpEvent = fromEvent(this.input && this.input.nativeElement, 'keyup').pipe(map(i => i))
            const debouncedInput = keyUpEvent && keyUpEvent.pipe(debounceTime(250))
            const searching =
                this.input &&
                debouncedInput.subscribe(async val => {
                    let searchText = this.formControlAlias.value
                    if (searchText !== '') {
                        try {
                            let schoolResults: any[] = []
                            schoolResults = await this._auth.getSchoolDistrict(searchText).toPromise()
                            this.displayResults(schoolResults)
                        } catch (err) {
                            console.error(err)
                        }
                    } else {
                        this.schoolSuggestShow = false
                    }
                })
        }, 1)
    }

    /**
     * Sets up the results that come back so a user can select them
     * @param results search Results that we get from the school/district lookup
     */
    private displayResults(results: any): void {
        this.schools = results
        this.schoolSuggestShow = true
    }

    /**
     * Set the school name in the field and then set the school details to the form object
     * @param school is the school that the user selected!
     */
    public setSchoolInfo(school: any) {
        this.schoolSuggestShow = false
        // set the schoolInfo so we can save it on form submit
        this.schoolInfo.district_id = school.nces_district_id
        this.schoolInfo.district_name = school.district
        this.schoolInfo.school_id = school.nces_school_id
        this.schoolInfo.school_name = school.school_name
        // update the form with the selected school
        this.formControlAlias.setValue(school.school_name)
    }
}