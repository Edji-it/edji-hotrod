import { Component, ElementRef, Input } from '@angular/core'
import { Subscription } from 'rxjs'

// Project Dependencies
import { EdjiComment } from 'src/app/shared/datatypes'

@Component({
  selector: 'edji-teacher-feedback',
  templateUrl: './teacher-feedback.component.pug',
})
export class TeacherFeedbackComponent {
  @Input() feedback: EdjiComment
  @Input() teacherName: string

  public subscriptions: Subscription[] = []

  constructor(public element: ElementRef) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
  }

  /**
   * Assign the feedback with _id to set up the attribute
   * @param feedback is the feedback record
   */
  public feedbackAttribute(feedback: any): string {
    return `fb-${feedback && feedback._id}`
  }
}
