import { EdjiComment, iCommentStats, Project, User } from './'
import { UserCommentStats, userReadingStatus } from './comment'

export class CommentStats {
  public _stats: iCommentStats = {
    reply_count: 0,
    comment_count: 0,
    comment_max: 0,
    comment_min: 0,
    comment_avg: 0,
    userStats: [],
  }
  public teacherIds: string[]

  constructor(project?: Project) {
    this._stats = this.initStats(project)
  }

  get stats(): iCommentStats {
    return this._stats
  }
  set stats(stats: iCommentStats) {
    this._stats = stats
  }

  public initStats(project?: Project): iCommentStats {
    let commentStats: iCommentStats = {
      reply_count: 0,
      comment_count: 0,
      comment_max: 0,
      comment_min: 0,
      comment_avg: 0,
      userStats: [],
    }

    // if there's not a project, just return the default commentStats
    if (!project) {
      return commentStats
    }
    /**
     * @todo Teacher ids should be referenced directly from the project, so they are kept up to date
     * - This should be done as comment stats logic is pushed into either the project service or a separate one
     */
    this.teacherIds = []
    // Push teacher id
    if (project && project.teacher_id) {
      this.teacherIds.push(project.teacher_id)
    }
    // Push co-teacher ids
    if (project && project.co_owner_ids) {
      this.teacherIds = this.teacherIds.concat(project.co_owner_ids)
    }
    // loop through student ids and add them to the array
    //  we have to do this because some students won't make a comment, so this is their only data on the project
    //  looping through addCommentToStats will later increment the count
    let len = (project.students && project.students.length) || 0
    for (let i = 0; i < len; i++) {
      let student = project.students[i]

      commentStats.userStats.push({
        _id: student._id,
        comment_count: 0,
        reply_count: 0,
        emoji_comment_count: 0,
        text_comment_count: 0,
        audio_comment_count: 0,
        fullname: student.fullname,
        comments: [],
        status: 'offline',
      })
    }

    // do the same for temp student ids
    len = (project.temps && project.temps.length) || 0
    for (let i = 0; i < len; i++) {
      let student = project.temps[i]

      commentStats.userStats.push({
        _id: student._id,
        comment_count: 0,
        reply_count: 0,
        emoji_comment_count: 0,
        text_comment_count: 0,
        audio_comment_count: 0,
        fullname: student.fullname,
        comments: [],
        status: 'offline',
      })
    }
    return commentStats
  }

  /**
   * This will go back and add the missing user information to the commentStats object so the leaderboard is fully updated
   * @param commentStats existing comment stats object that we're going to modify
   * @param project the current project the user is on
   */
  public addUsersToStats(commentStats: iCommentStats, project: Project): iCommentStats {
    // Run through the students and add the user to the stats if they're not already in the list
    let len = project.students.length
    for (let i = 0; i < len; i++) {
      let student = project.students[i]
      // see if there is a student in the stats list already
      let studentFound = commentStats.userStats.find(el => el._id === student._id)
      // check for answered questions
      let studentQuestions = project.reading_id.questions
        ? this.getAnswers(project.reading_id.questions, project.answers, student)
        : []
      // add the student if they are not already in the list
      if (!studentFound) {
        commentStats.userStats.push({
          _id: student._id,
          comment_count: 0,

          reply_count: 0,
          emoji_comment_count: 0,
          text_comment_count: 0,
          audio_comment_count: 0,
          fullname: student.fullname,
          comments: [],
          status: 'offline',
          questions: studentQuestions,
        })
      }
    }
    // Run through the temps and add the user to the stats if they're not already in the list
    len = project.temps.length
    for (let i = 0; i < len; i++) {
      let student = project.temps[i]
      // see if there is a student in the stats list already
      let studentFound = commentStats.userStats.find(el => el._id === student._id)
      // check for answered questions
      let studentQuestions = project.reading_id.questions
        ? this.getAnswers(project.reading_id.questions, project.answers, student)
        : []
      // add the student if they are not already in the list
      if (!studentFound) {
        commentStats.userStats.push({
          _id: student._id,
          comment_count: 0,

          reply_count: 0,
          emoji_comment_count: 0,
          text_comment_count: 0,
          audio_comment_count: 0,
          fullname: student.fullname,
          comments: [],
          status: 'offline',
          questions: studentQuestions,
        })
      }
    }
    return commentStats
  }

  /**
   * Sets the stats back to a blank object
   */
  public resetStats(): void {
    this._stats = {
      comment_count: 0,
      comment_max: 0,
      comment_min: 0,
      comment_avg: 0,
      reply_count: 0,
      userStats: [],
    }
  }

  /**
   * Take a comment into account in the comment stats for a project
   * @param comment The comment which needs to be taken into account in the stats
   * @param difference The number to add/subtract. Should be 1, 0 or -1
   * @param commentStats The comment stats object which will be modified and returned
   */
  public addCommentToStats(comment: EdjiComment, difference: number): void {
    // if this is an answer, then do not do anything here
    if (comment.questionId) return

    let isReply = comment.reply_to && comment.reply_to.length > 0
    // increment the total reading comment count by the difference
    if (isReply) {
      this._stats.reply_count += difference
    } else {
      this._stats.comment_count += difference
    }

    // find the student in the array. if they don't exist and are adding a comment, then add to the count
    //  if they don't exist and are deleting a comment, log an error... we're not sure why that's happenning...
    let student = this.findStudent(comment.user_id)
    if (!student && difference > 0) {
      this._stats.userStats.push({
        _id: comment.user_id,
        fullname: comment.author,
        comment_count: isReply ? 0 : 1,
        reply_count: isReply ? 1 : 0,
        emoji_comment_count: comment.type === 'emoji' && !isReply ? 1 : 0,
        text_comment_count: comment.type === 'text' && !isReply ? 1 : 0,
        audio_comment_count: comment.type === 'audio' && !isReply ? 1 : 0,
        comments: [comment],
        status: this.findStudentStatus(comment.user_id),
      })
    } else if (student) {
      if (isReply) {
        student.reply_count += difference
      } else {
        student.comment_count += difference
        switch (comment.type) {
          case 'text':
            student.text_comment_count += difference
            break
          case 'emoji':
            student.emoji_comment_count += difference
            break
          case 'audio':
            student.audio_comment_count += difference
            break
        }
      }
      // handle adding comments -- reading report needs this
      if (!isReply) {
        if (difference > 0) {
          student.comments.push(comment)
        } else {
          let userCommentCount = student.comments.length
          for (let i = 0; i < userCommentCount; i++) {
            if (student.comments[i]._id === comment._id) {
              student.comments.splice(i, 1)
              break
            }
          }
        }
      }
    } else {
      // if we're trying to subtract from a non-existant student, then log this error... we don't want to do that.
      console.error("We tried subtracting a comment from a student who doesn't exist!")
    }

    this._stats.userStats.sort(this.compareStudents)
    // calculate min/max/avg values
    this.calculateMinMaxAvg()
  }

  public recalculateAnswers(answer: any, answerChange: boolean, project: Project): void {
    let student = this.findStudent(answer.user_id)
    if (student) {
      student.questions.find((ans: any) => ans.questionId === answer.questionId)
      const len = student.questions.length
      for (var i = 0; i < len; i++) {
        let question = student.questions[i]
        if (question._id === answer.questionId) {
          student.questions[i].answered = answerChange
        }
      }
    }
  }

  /**
   * Get a student from the _stats.userStats array by _id
   * @param _id the _id from the student that you want to find
   * @returns the object in the array that matches that id
   */
  private findStudent(_id: string): UserCommentStats {
    return this._stats.userStats.find(student => {
      return student._id == _id
    })
  }

  /**
   * Returns the current status for the comment user
   * Primarily used when populating comments because we can't assign a status multiple times (we'll let the student user indicate their status with sockets)
   * @param _id the comment user's _id
   */
  private findStudentStatus(_id: string): userReadingStatus {
    let student = this._stats.userStats.find(student => {
      return student._id === _id
    })
    return (student && student.status) || 'offline'
  }

  /**
   * Compares two students' counts together and returns number to match API of Array.prototype.sort()
   *  used to sort the array of students
   */
  private compareStudents(stu1: UserCommentStats, stu2: UserCommentStats): number {
    let stu1Count = stu1.comment_count + stu1.reply_count
    let stu2Count = stu2.comment_count + stu2.reply_count
    if (stu1Count < stu2Count) {
      return 1
    }
    if (stu1Count > stu2Count) {
      return -1
    }
    return 0
  }

  /**
   * Calculates extra stats that we need for the reading report
   */
  private calculateMinMaxAvg(): void {
    var lowest = Number.POSITIVE_INFINITY
    var highest = Number.NEGATIVE_INFINITY
    var tmp
    let userLength = this._stats.userStats.length
    var avgSum = 0

    for (var i = userLength - 1; i >= 0; i--) {
      // only calculate these stats for the students
      if (this.teacherIds.indexOf(this._stats.userStats[i]._id) === -1) {
        tmp = this._stats.userStats[i].comment_count
        avgSum += this._stats.userStats[i].comment_count
        if (tmp < lowest) lowest = tmp
        if (tmp > highest) highest = tmp
      }
    }

    // set the stats values for max, min, and average
    this._stats.comment_max = highest
    this._stats.comment_min = lowest
    this._stats.comment_avg = Math.round(avgSum / userLength)
  }

  /**
   * Updates the user status on the commentStats.userStats
   * @param user current user
   * @param status is of type userReadingStatus (offline, idle, or active)
   */
  public userStatus(user: any, status: userReadingStatus) {
    let student = this.findStudent(user._id)
    if (student) {
      student.status = status
    }
  }

  /**
   * Checks through the answers on the project to see if a student has answered each of the questions on that reading
   * @param questions the array of question _id's and answered value (boolean)
   * @param answers answers on the project
   * @param student current student we're evaluating for
   */
  private getAnswers(readingQuestions: any, answers: any, student: any): any[] {
    const len = readingQuestions.length
    let questions = []
    for (var i = 0; i < len; i++) {
      let ans = false // default
      let question = readingQuestions[i]
      if (answers) {
        let answerFound = answers.find((ans: any) => ans.questionId === question._id && ans.user_id === student._id)
        if (answerFound) {
          ans = true
        }
      }
      questions.push({
        _id: question._id, // reference
        answered: ans,
      })
    }
    return questions
  }
}
