import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'

import { AuthService, ProjectService } from './../../shared'
import { User } from "app/shared/datatypes"

@Component({
  selector: 'hot-add-project-modal',
  templateUrl: 'add-project.component.html'
})
export class AddProjectModal implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  @Input() reading: any;
  private projectForm: FormGroup
  private formSubmitted: boolean = false;
  private errors: {
    serviceError ?: boolean,
    invalidCode?: boolean,
    groupNameLength?: boolean
  } = {};
  private commentTypes: any = []
  private canChooseTypes: boolean = false 
  private customCode: string = ''
  private user: User

  constructor(
    private _projects: ProjectService, 
    private _fb: FormBuilder,
    private _auth: AuthService
    ) {
  }

  ngOnInit() { 
    this.user = this._auth.getUser()

    // Get authorized comment types
    this.commentTypes = this._auth.getAllowedCommentTypes()

    this.projectForm = this._fb.group({
      label: [null, Validators.required],
      emojiType: true,
      textType: true,
      audioType: this.commentTypes.indexOf('audio') > -1 ? true : false,
      replyType: this.commentTypes.indexOf('reply') > -1 ? true : false,
      customCode: ''
    });

    this.canChooseTypes = this._auth.getUser().hero_status
  }

  /**
   * Create a fresh Project for a given Reading, then push it back to the dashboard
   */
  addProject(formValue: any) {
    // reset errors
    this.errors = {};

    // trigger form submission and check for form errors
    this.formSubmitted = true;
    if (!this.projectForm.valid) { return; }

    let types = [];
    if (formValue.emojiType) { types.push("emoji"); }
    if (formValue.textType) { types.push("text"); }
    if (formValue.audioType) { types.push("audio"); }
    if (formValue.replyType) { types.push("reply"); }

    this._projects.validateProject(formValue.customCode)
      .pipe(take(1))
      .subscribe(
        (success) => {
          // this actually means that the code already exists, so we give the user an error here
          this.errors.invalidCode = true
          return
        },
        (err) => {
          if (err.status == 404) {
            // no code found - they're good to create the new one!
            this._projects.create(this.reading._id, { 'label' : formValue.label, 'types' : types, 'code': formValue.customCode } )
              .subscribe( project => {
                if (project._id) {
                  project.new = true;
                  this.reading.projects.push(project);
                  this.closeModal.emit();
                }
              }, error => {
                console.error(error);
                this.errors.serviceError = true;
              });
          } else {
            this.errors.serviceError = true
          }
        }
      )
  }
}