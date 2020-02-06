import { EdjiComment, iCommentStats, Project } from './'
import { UserCommentStats, UserReadingStatus } from './comment'

export class CommentStats {
  private _allStudents = []
  private _stats: iCommentStats = {
    reply_count: 0,
    comment_count: 0,
    student_comments: 0,
    comment_max: 0,
    comment_min: 0,
    comment_avg: 0,
    userStats: [],
  }
  public teacherId: string

  constructor(project?: Project) {
    if (project) {
      this.processComments(project)
    }
  }

  get stats(): iCommentStats {
    return { ...this._stats }
  }

  public processComments(project: Project) {
    /**
     * This lets us preserve status info between processing the comments twice. It's desirable to be able
     * to build comment stats from a project without state, so this works around the state of the students' activity
     * to copy it between times that comment stats are built
     */
    const knownStudentStatuses = this._stats.userStats.map(s => ({ _id: s._id, status: s.status }))
    // reset stats
    this._stats = {
      reply_count: 0,
      comment_count: 0,
      student_comments: 0,
      comment_max: 0,
      comment_min: 0,
      comment_avg: 0,
      userStats: [],
    }
    this._allStudents = [].concat(project.students || []).concat(project.temps || [])
    this.teacherId = project.teacher_id
    // prep each students' stats
    this._stats.userStats = this._allStudents.map(student => {
      const studentStatus = knownStudentStatuses.find(({ _id }) => _id === student._id)
      const studentStats: UserCommentStats = {
        _id: student._id,
        comment_count: 0,
        reply_count: 0,
        emoji_comment_count: 0,
        text_comment_count: 0,
        audio_comment_count: 0,
        fullname: student.fullname,
        comments: [],
        status: (studentStatus && studentStatus.status) || 'offline',
      }
      if (project.reading_id.questions) {
        studentStats.questions = project.reading_id.questions.map(q => ({ _id: q._id }))
      }
      return studentStats
    })
    project.comments.forEach(comment => this.addCommentToStats(comment))
    project.answers.forEach(answer => this.calculateAnswers(answer))
    this.calculateMinMaxAvg()
    this._stats.userStats.sort(this.compareStudents)
  }

  /**
   * Take a comment into account in the comment stats for a project
   * @param comment The comment which needs to be taken into account in the stats
   * @param difference The number to add/subtract. Should be 1, 0 or -1
   * @param commentStats The comment stats object which will be modified and returned
   */
  private addCommentToStats(comment: EdjiComment): void {
    const student = this.findStudent(comment.user_id)
    if (!student) return // teachers comments do not count
    const isReply = comment.reply_to && comment.reply_to.length > 0
    // increment the total reading comment count by the difference
    if (isReply) {
      this._stats.reply_count += 1
      student.reply_count += 1
    } else {
      this._stats.comment_count += 1
      student.comment_count += 1
      switch (comment.type) {
        case 'text':
          student.text_comment_count += 1
          break
        case 'emoji':
          student.emoji_comment_count += 1
          break
        case 'audio':
          student.audio_comment_count += 1
          break
      }
    }

    // handle adding comments -- reading report needs this
    if (!isReply) {
      student.comments.push(comment)
    }
  }

  private calculateAnswers(answer: EdjiComment): void {
    let student = this.findStudent(answer.user_id)
    if (student) {
      const q = student.questions.find(q => q._id === answer.questionId)
      if (q) q.answered = true
    }
  }

  /**
   * Get a student from the _stats.userStats array by _id
   * @param _id the _id from the student that you want to find
   * @returns the object in the array that matches that id
   */
  public findStudent(_id: string): UserCommentStats {
    return this._stats.userStats.find(student => {
      return student._id === _id
    })
  }

  /**
   * Returns the current status for the comment user
   * Primarily used when populating comments because we can't assign a status multiple times (we'll let the student user indicate their status with sockets)
   * @param _id the comment user's _id
   */
  private findStudentStatus(_id: string): UserReadingStatus {
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
    let lowest = Number.POSITIVE_INFINITY
    let highest = Number.NEGATIVE_INFINITY
    let sum = 0

    this._stats.userStats.forEach(stat => {
      if (this.teacherId === stat._id) return
      sum += stat.comment_count
      if (stat.comment_count < lowest) lowest = stat.comment_count
      if (stat.comment_count > highest) highest = stat.comment_count
    })

    // set the stats values for max, min, and average
    this._stats.comment_max = highest
    this._stats.comment_min = lowest
    this._stats.comment_avg = Math.round(sum / this._stats.userStats.length)
    this._stats.student_comments = sum
  }

  /**
   * Updates the user status on the commentStats.userStats
   * @param user current user
   * @param status is of type UserReadingStatus (offline, idle, or active)
   */
  public setUserStatus(userId: string, status: UserReadingStatus) {
    let student = this.findStudent(userId)
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
        let answerFound = answers.find(ans => ans.questionId === question._id && ans.user_id === student._id)
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
