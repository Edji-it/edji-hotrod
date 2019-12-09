import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'

// Project Dependencies
import { Reading } from './../../shared/datatypes'
import { ReadingService } from './../../_services'
import { IMultiSelectOption, IMultiSelectSettings } from '../../_directives'

@Component({
  selector: 'hot-discover-add-meta',
  templateUrl: './discover-add-meta.component.pug',
  styleUrls: ['discover-add-meta.component.scss'],
})
export class DiscoverAddMetaModal implements OnInit {
  @Input() showModal: boolean
  @Input() reading: Reading
  @Output() closeModal: EventEmitter<any> = new EventEmitter()

  private readingMetaForm: FormGroup
  private messages: {
    success?: boolean
    serviceError?: boolean
  } = {}
  private multiselectExpanded: boolean
  private projectLink: string

  // IMultiSelectOption[]
  private subjects: any = [
    { id: 'literature', name: 'Language Arts' },
    { id: 'math', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'geography', name: 'Geography' },
    { id: 'history', name: 'History' },
    { id: 'government', name: 'Government' },
    { id: 'health', name: 'Health/Physical Education' },
    { id: 'languages', name: 'Foreign Languages' },
    { id: 'art', name: 'Art' },
    { id: 'computer', name: 'Computers/Technical' },
  ]
  // IMultiSelectSettings
  private subjectDropSettings: any = {
    displayAllSelectedText: true,
    dynamicTitleMaxItems: 4,
  }

  constructor(private _readings: ReadingService, _fb: FormBuilder) {
    this.readingMetaForm = _fb.group({
      subjects: [[], Validators.required],
      grade_levels: [[], Validators.required],
    })
  }

  ngOnInit() {
    if (this.reading && this.reading.projects && this.reading.projects.length > 0) {
      this.projectLink = this.reading.projects[0]._id
    }
  }

  private formSubmit(form: FormGroup): void {
    // cache the reading since the server will return a reading stripped of projects, and we only want to update the public flag on return
    let updateReading = this.reading
    // Add subjects, grade levels, and make the reading public
    updateReading.subjects = form.value.subjects
    updateReading.grade_levels = form.value.grade_levels
    updateReading.reading_type = 'public'
    //  Make the call to PUT the reading public value
    this._readings.save(updateReading).subscribe(
      data => {
        if (data._id) {
          this.reading.subjects = data.subjects
          this.reading.grade_levels = data.grade_levels
          this.closeModal.emit()
        }
      },
      error => {
        console.error(error)
      },
    )
  }
}
