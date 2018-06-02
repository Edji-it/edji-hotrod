import { Subscription } from 'rxjs'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

import { CommentStats, Reading } from './../../../shared/datatypes'
import { ProjectService, ReadingService } from '../../../_services'

@Component({
  selector: 'hot-leaderboard',
  templateUrl: 'leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})

export class LeaderboardComponent implements OnInit {
  @Input() visible = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  /** This is a reference to the actual commentStats object which has methods for modification of properties */
  @Input() commentStats: CommentStats

  private currentReading: Reading
  private subscriptions: Subscription[] = []
  private answersById: any = {}
  private userAnswers: any[] = []

  constructor(
    private _readings: ReadingService,
    private _projects: ProjectService
  ) { }

  ngOnInit() {
    // Subscribe to the reading
    this.subscriptions.push( this._readings.currentReading.subscribe(
      reading => {
        this.currentReading = reading
      },
      error => {
        console.error(error)
      })
    )

    // Subscribe to updates to the answer reference object
    this.subscriptions.push( this._projects.answersById.subscribe(
      (answersById) => {
        this.answersById = answersById
        this.questionAnswerStatus()
      },
      (error) => {
        console.error(error)
      })
    )

  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe() })
  }

  private questionAnswerStatus() {
    let answered: boolean
    this.userAnswers = []

    // check if there is a user, and the reading contains questions
    if (this.commentStats.stats.userStats && this.commentStats.stats.userStats.length > 0 && this.currentReading.questions && this.currentReading.questions.length > 0) {

      // loop through the userStats to get answered questions by each user in the reading
      for (let i = 0; i < this.commentStats.stats.userStats.length; i++) {
        const commentUser = this.commentStats.stats.userStats[i]

        // loop through the reading's available questions
        for (let j = 0; j < this.currentReading.questions.length; j++) {
          const question = this.currentReading.questions[j]
          // check if the question has answers
          if (this.answersById[question._id] && this.answersById[question._id].length > 0) {
            // loop through the answers by that question ID
            for (let k = 0; k < this.answersById[question._id].length; k++) {
              const answer = this.answersById[question._id][k]
              if (answer.user_id === commentUser._id) {
                answered = true
                break
              }
            }
            // if the user has answered that question, then break and mark it answered (default is not answered)
            const userAnswerObj = {
              user: commentUser._id,
              answered: answered
            }
            this.userAnswers.push(userAnswerObj)
            answered = false
          }
        }
      }
    }
  }
}
