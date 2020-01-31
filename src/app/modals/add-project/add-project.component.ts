import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, ElementRef, QueryList } from '@angular/core'
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms'
import { take } from 'rxjs/operators'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { AuthService } from './../../_services'
import { User } from '../../shared/datatypes'
import { ProjectStore } from 'src/app/_store'

@Component({
  selector: 'hot-add-project-modal',
  templateUrl: 'add-project.component.pug',
})
export class AddProjectModal implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter()
  @Output() groupSaved: EventEmitter<boolean> = new EventEmitter()

  @Input() reading: any

  // Optional copy inputs
  @Input() heading: string
  @Input() subheading: string
  @Input() groupLabel: string
  @Input() largeReadingWarning: boolean
  @Input() showGuideMessage: boolean
  @Input() hideInstructions: boolean

  @ViewChildren('quickLabel') labelInputs: QueryList<any>

  public projectForm: FormGroup
  public formSubmitted: boolean = false
  public errors: {
    serviceError?: boolean
    invalidCode?: boolean
    groupNameLength?: boolean
  } = {}
  public commentTypes: any = []
  public isHero: boolean = false
  public customCode: string = ''
  public user: User
  public loading: boolean

  constructor(
    private projectStore: ProjectStore,
    private _fb: FormBuilder,
    private _auth: AuthService,
    private angulartics: Angulartics2,
  ) {}

  ngOnInit() {
    this.user = this._auth.getUser()
    // isHero turns Hero-only group features on/off
    this.isHero = this.user.hero_status

    this.projectForm = this._fb.group({
      label: [this.groupLabel ? this.groupLabel : '', Validators.required],
      emojiType: true,
      textType: true,
      audioType: true,
      replyType: true,
      customCode: ['', { disabled: !this.isHero }],
      groupInstructions: this.reading.default_instructions || '',
      quickLabels: this._fb.array([this._fb.group({ label: '' })]),
    })
  }

  /**
   * Create a fresh Project for a given Reading, then push it back to the dashboard
   */
  addProject(formValue: any) {
    // reset errors
    this.errors = {}
    // trigger form submission and check for form errors
    this.formSubmitted = true
    if (!this.projectForm.valid) {
      return
    }
    // Start loading spinner! If we're valid, we're requesting
    this.loading = true

    if (formValue.customCode) {
      // Validate custom codes
      this.projectStore.join(formValue.customCode).subscribe(
        data => {
          if (data.found) {
            // this actually means that the code already exists, so we give the user an error here
            this.errors.invalidCode = true
            this.loading = false
          } else if (data.found === false) {
            // Custom code does not exist! You are free to use it
            this.createProject(formValue)
          } else {
            this.errors.serviceError = true
          }
        },
        err => {
          console.error(err)
          this.loading = false
          this.errors.serviceError = true
        },
      )
    } else {
      // Otherwise create project with random code (picked by server)
      this.createProject(formValue)
    }
  }

  /**
   * Create and emit project and close the modal
   * - Run after validating the project (including custom codes)
   */
  createProject(formValue) {
    let types = []
    if (formValue.emojiType) {
      types.push('emoji')
    }
    if (formValue.textType) {
      types.push('text')
    }
    if (formValue.audioType) {
      types.push('audio')
    }
    if (formValue.replyType) {
      types.push('reply')
    }
    // no code found - they're good to create the new one!
    let newProject = {
      label: formValue.label,
      types: types,
      code: formValue.customCode,
      group_instructions: formValue.groupInstructions,
      quick_labels: this.getQuickLabelStrings(),
    }
    this.projectStore.create(this.reading._id, newProject).subscribe(
      project => {
        if (project._id) {
          project.new = true
          this.trackAnalyticEvent(formValue, types)
          this.groupSaved.emit(project)
        }
      },
      error => {
        console.error(error)
        this.errors.serviceError = true
      },
    )
  }

  // there is a bit of setup for this event, so we'll handle this offsite
  private trackAnalyticEvent(formValue: any, types: any) {
    let customGroupName = false
    let customGroupCode = false
    let groupInstructions = false
    let commentTypes = ''
    // did the user put in a custom group name?
    if (formValue.label.length > 0) {
      customGroupName = true
    }
    // did the user put in a custom group code?
    if (formValue.customCode.length > 0) {
      customGroupCode = true
    }
    // did the user put in group instructions?
    if (formValue.groupInstructions.length > 0) {
      groupInstructions = true
    }
    types.forEach(type => {
      commentTypes += type + '-'
    })
    // fire an analytic event here for tracking purposes
    this.angulartics.eventTrack.next({
      action:
        'newGroup_' +
        commentTypes.substring(0, commentTypes.length - 1) +
        '_' +
        customGroupName +
        '_' +
        customGroupCode +
        '_' +
        groupInstructions,
      properties: { category: this._auth.setAnalyticEventCategory(), label: this._auth.setAnalyticEventLabel() },
    })
  }

  /**
   * Quick Label setters and accessors
   */
  get quickLabels() {
    return this.projectForm.get('quickLabels') as FormArray
  }

  addQuickLabel(focusNew?: boolean) {
    this.quickLabels.push(this._fb.group({ label: '' }))
    focusNew &&
      setTimeout(() => {
        // Let new label render
        this.labelInputs.last.nativeElement.focus()
      })
  }

  deleteQuickLabel(index) {
    this.quickLabels.removeAt(index)
  }

  getQuickLabelStrings() {
    let values: string[] = []
    this.quickLabels.value.forEach(control => {
      if (control.label) {
        values.push(control.label)
      }
    })
    return values
  }
}
