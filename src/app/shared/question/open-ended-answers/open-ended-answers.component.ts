import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'
import { Angulartics2 } from 'angulartics2'

// Project Dependencies
import { BaseAnswerComponent } from '../base-answer.component'
import { EdjiComment, EdjiQuestion, Project, Reading, User } from '../../datatypes'
import { CommentService, AuthService, ProjectService, ReadingService } from '../../../_services'
import { ProjectStore } from 'src/app/_store'

@Component({
  selector: 'open-ended-answers',
  templateUrl: './open-ended-answers.component.html',
  styleUrls: ['./open-ended-answers.component.scss'],
})
export class OpenEndedAnswersComponent extends BaseAnswerComponent {
  /*
    3 Aug 2017
    Nick Pumper
    Last Mod: 5 Aug 2017

    Handles the display and processing of open ended answers for EdjiQuestion's.
    - A child of BaseAnswerComponent.

    NOTES:
      - 8.4.17 - For some reason inheriting from the abstract required me to use 
        " extends (BaseAnswerComponent as {new();})". No idea why, just follow it.
  */

  // This variable will allow the user to pick their preferred comment type.
  @Input()
  public enabledAnswerTypes: any[]

  constructor(
    // This needs to be here because of inheritance from BaseAnswerComponent.
    private projectStore: ProjectStore,
    private readings: ReadingService,
    private auth: AuthService,
    private comments: CommentService,
    private angulartics: Angulartics2,
  ) {
    super(projectStore, readings, auth, comments, angulartics)
  }

  ngOnInit() {}

  // Tell the server we've got ourselves a new answer, aka a new EdjiComment
  public outputAnswer(type: string): void {
    // Make the comment to provide as the answer.
    var newResponse = <EdjiComment>{
      data: '',
      type: type,
      author: this.auth.getUser().fullname ? this.auth.getUser().fullname : this.auth.getUser().username,
    }

    if (type == 'emoji') {
      this.activeEmojiKeyboardReply(newResponse)
    }

    // Ask the base class to send the comment to the server.
    this.saveAnswer(newResponse)
  }
}
