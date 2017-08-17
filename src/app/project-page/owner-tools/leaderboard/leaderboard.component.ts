import { Subscription } from 'rxjs/Rx'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

import { CommentStats, Reading } from './../../../shared/datatypes'

import { ProjectService } from '../../../shared/project.service'
import { ReadingService } from '../../../shared/reading.service'

@Component({
  selector: 'hot-leaderboard',
  templateUrl: 'leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})

export class LeaderboardComponent implements OnInit {
  @Input() visible: boolean = false
  @Output() hide: EventEmitter<any> = new EventEmitter()

  /** This is a reference to the actual commentStats object which has methods for modification of properties */
  @Input() commentStats: CommentStats
  
  private currentReading: Reading
  private subscriptions: Subscription[] = []
  private answersById: any = {}

  constructor(
    private _readings: ReadingService,
    private _projects : ProjectService
  ) { }

  ngOnInit() {
    // Subscribe to the reading
    this.subscriptions.push( this._readings.currentReading.subscribe(
      reading => {
        this.currentReading = reading;
      },
      error => {
        console.error(error);
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
    // if (this.currentReading && this.currentReading.questions && this.currentReading.questions.length>0) {
    // // console.log('function run')
    //   for (let i=0;i<this.currentReading.questions.length;i++) {
    //     // console.log(this.currentReading.questions[i])
    //     // for (let j=0;j<this.answersById[this.currentReading.questions[i]._id].length;j++) {
    //     //     console.log(this.answersById[this.currentReading.questions[i]._id][j])
    //     //   if (this.answersById[this.currentReading.questions[i]._id]) {
    //     //     console.log(this.answersById[this.currentReading.questions[i]._id])
    //     //   }
    //     // }
    //     // console.log(this.answersById[this.currentReading.questions[i]._id])
    //   }
    // }
  }

  private testAnswerFilter(commentUser: any) {
    console.log(commentUser)
  }
}