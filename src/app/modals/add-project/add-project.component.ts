import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'hot-add-project-modal',
  templateUrl: 'add-project.component.html'
})
export class AddProjectModal implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  @Input() reading: any;
  private projectForm: FormGroup
  private formSubmitted: boolean = false;

  constructor(_fb: FormBuilder) {
    this.projectForm = _fb.group({
      label: [null, Validators.required],
      emojiType: null,
      textType: null
    });
  }

  ngOnInit() { }

  addProject(formValue: any) {
    this.formSubmitted = true;
    console.log(formValue);
  }
}