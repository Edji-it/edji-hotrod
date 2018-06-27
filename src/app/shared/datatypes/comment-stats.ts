import { EdjiComment, iCommentStats, Project } from './'
import { UserCommentStats } from './comment';

export class CommentStats {
  private _stats: iCommentStats = {
    reply_count: 0,
    comment_count: 0,
    userStats: []
  }

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
        userStats: []
    }

    // if there's not a project, just return the default commentStats
    if (!project) {
      return commentStats
    }

    // loop through student ids and add them to the array
    //  we have to do this because some students won't make a comment, so this is their only data on the project
    //  looping through addCommentToStats will later increment the count
    let len = project.students_ids.length
    for(let i = 0; i < len; i++) {
        let student = project.students_ids[i]

        commentStats.userStats.push({
            _id: student._id,
            comment_count: 0,
            reply_count: 0,
            fullname: student.fullname
        })
    }

    // do the same for temp student ids
    len = project.temp_ids.length
    for(let i = 0; i < len; i++) {
        let student = project.temp_ids[i]

        commentStats.userStats.push({
            _id: student._id,
            comment_count: 0,
            reply_count: 0,
            fullname: student.fullname
        })
    }

    return commentStats
  }

  /**
   * Sets the stats back to a blank object
   */
  public resetStats(): void {
    this._stats = { comment_count: 0, reply_count: 0, userStats: [] }
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
            })
        } else if (student) {
            if (isReply) {
                student.reply_count += difference
            } else {            
                student.comment_count += difference
            }
        } else {
            // if we're trying to subtract from a non-existant student, then log this error... we don't want to do that.
            console.error("We tried subtracting a comment from a student who doesn't exist!")
        }

        this._stats.userStats.sort(this.compareStudents)
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
}