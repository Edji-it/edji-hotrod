import { EdjiComment, iCommentStats, Project } from './'
import { UserCommentStats } from './comment';

export class CommentStats {
  public _stats: iCommentStats = {
    reply_count: 0,
    comment_count: 0,
    comment_max: 0,
    comment_min: 0,
    comment_avg: 0,
    userStats: []
  }
  public teacherId: string

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
        userStats: []
    }

    // if there's not a project, just return the default commentStats
    if (!project) {
      return commentStats
    }

    this.teacherId = project && project.teacher_id ? project.teacher_id : ''

    console.log('initStats project', project._id, project)
    console.log('student ids', project.students_ids)
    console.log('temp ids', project.temp_ids)

    // loop through student ids and add them to the array
    //  we have to do this because some students won't make a comment, so this is their only data on the project
    //  looping through addCommentToStats will later increment the count
    let len = project.students_ids.length
    for(let i = 0; i < len; i++) {
        let student = project.students_ids[i]
        console.log('student id', student)
        console.log('student name', student.fullname)

        commentStats.userStats.push({
            _id: student._id,
            comment_count: 0,
            reply_count: 0,
            emoji_comment_count: 0,
            text_comment_count:  0,
            audio_comment_count: 0,
            fullname: student.fullname,
            comments: []
        })
        console.log('student stats populate', commentStats.userStats.length)
    }

    // do the same for temp student ids
    len = project.temp_ids.length
    for(let i = 0; i < len; i++) {
        let student = project.temp_ids[i]
        console.log('temp id', student)
        console.log('temp name', student.fullname)

        commentStats.userStats.push({
            _id: student._id,
            comment_count: 0,
            reply_count: 0,
            emoji_comment_count: 0,
            text_comment_count:  0,
            audio_comment_count: 0,
            fullname: student.fullname,
            comments: []
        })
        console.log('temp stats populate', commentStats.userStats.length)
    }

    console.log(commentStats)

    return commentStats
  }

  /**
   * Sets the stats back to a blank object
   */
  public resetStats(): void {
    console.log('reset the stats')
    this._stats = { 
      comment_count: 0, 
      comment_max: 0,
      comment_min: 0,
      comment_avg: 0, 
      reply_count: 0, 
      userStats: [] 
    }
  }

  /**
   * Take a comment into account in the comment stats for a project
   * @param comment The comment which needs to be taken into account in the stats
   * @param difference The number to add/subtract. Should be 1, 0 or -1
   * @param commentStats The comment stats object which will be modified and returned
   */
  public addCommentToStats(comment: EdjiComment, difference: number): void {
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
        emoji_comment_count: comment.type==='emoji' && !isReply ? 1 : 0,
        text_comment_count: comment.type==='text' && !isReply ? 1 : 0,
        audio_comment_count: comment.type==='audio' && !isReply ? 1 : 0,
        comments: [comment]
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
          for (let i=0; i<userCommentCount; i++) {
            if (student.comments[i]._id===comment._id) {
              student.comments.splice(i,1)
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

  /** 
   * Get a student from the _stats.userStats array by _id
   * @param _id the _id from the student that you want to find
   * @returns the object in the array that matches that id
   */
  private findStudent(_id: string): UserCommentStats {
    return this._stats.userStats.find((student) => {
      return student._id == _id
    })
  }

  /**
   * Compares two students' counts together and returns number to match API of Array.prototype.sort()
   *  used to sort the array of students
   */
  private compareStudents(
    stu1: UserCommentStats, stu2: UserCommentStats
  ): number {
    let stu1Count = stu1.comment_count + stu1.reply_count
    let stu2Count = stu2.comment_count + stu2.reply_count
    if (stu1Count < stu2Count) { return 1 }
    if (stu1Count > stu2Count) { return -1 }
    return 0
  }

  /**
   * Calculates extra stats that we need for the reading report
   */
  private calculateMinMaxAvg(): void {
    var lowest = Number.POSITIVE_INFINITY;
    var highest = Number.NEGATIVE_INFINITY;
    var tmp
    let userLength = this._stats.userStats.length
    var avgSum = 0
    
    for (var i=userLength-1; i>=0; i--) {
      // only calculate these stats for the students
      if (this._stats.userStats[i]._id!==this.teacherId) {
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
}