import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { ProjectService } from './../../shared';

@Component({
  selector: 'hot-add-project-modal',
  templateUrl: 'add-project.component.html'
})
export class AddProjectModal implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  @Input() reading: any;
  private projectForm: FormGroup
  private formSubmitted: boolean = false;
  private errors: { serviceError ?: boolean } = {};

  constructor(private _projects: ProjectService, _fb: FormBuilder) {
    this.projectForm = _fb.group({
      label: [null, Validators.required],
      emojiType: true,
      textType: true
    });
  }

  ngOnInit() { console.log(this.reading); }

  /**
   * Create a fresh Project for a given Reading, then push it back to the dashboard
   */
  addProject(formValue: any) {
    // reset errors
    this.errors.serviceError = false;

    // trigger form submission and check for form errors
    this.formSubmitted = true;
    if (!this.projectForm.valid) { return; }

    let types = [];
    if (formValue.emojiType) { types.push("emoji"); }
    if (formValue.textType) { types.push("text"); }

    this._projects.create(this.reading._id, { 'label' : formValue.label, 'types' : types } )
      .subscribe( project => {
        if (project._id) {
          project.new = true;
          this.reading.projects.push(project);
          this.closeModal.emit();
        }
      }, error => {
        console.log(error);
        this.errors.serviceError = true;
      });
  }
}