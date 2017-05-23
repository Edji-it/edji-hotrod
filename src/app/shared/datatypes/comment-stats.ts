import { EdjiComment, iCommentStats, Project } from './'

export class CommentStats {
  private _stats: iCommentStats = {
    count: 0,
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
        count: 0,
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
            count: 0,
            fullname: student.fullname
        })
    }

    len = project.temp_ids.length
    for(let i = 0; i < len; i++) {
        let student = project.temp_ids[i]

        commentStats.userStats.push({
            _id: student._id,
            count: 0,
            fullname: student.fullname
        })
    }

    return commentStats
  }

  /**
   * Sets the stats back to a blank object
   */
  public resetStats(): void {
    this._stats = { count: 0, userStats: [] }
  }

    /**
     * Take a comment into account in the comment stats for a project
     * @param comment The comment which needs to be taken into account in the stats
     * @param add If true, it will add the comment to stats, if false it subtracts
     * @param commentStats The comment stats object which will be modified and returned
     */
    public addCommentToStats(comment: EdjiComment, add: boolean): void {
        let difference = add ? 1 : -1

        // increment the total reading comment count by the difference
        this._stats.count += difference

        // find the student in the array. if they don't exist and are adding a comment, then add to the count
        //  if they don't exist and are deleting a comment, log an error... we're not sure why that's happenning...
        let student = this.findStudent(comment.user_id)
        if (!student && difference > 0) {
            this._stats.userStats.push({
                _id: comment.user_id,
                fullname: comment.author,
                count: 1
            })
        } else if (student) {
            student.count += difference
        } else {
            // if we're trying to subtract from a non-existant student, then log this error... we don't want to do that.
            console.error("We tried subtracting a comment from a student who doesn't exist!")
        }
    }

    /** 
     * Get a student from the _stats.userStats array by _id
     * @param _id the _id from the student that you want to find
     * @returns the object in the array that matches that id
     */
    private findStudent(_id: string): { _id: string, fullname: string, count: number } {
        return this._stats.userStats.find((student) => {
            return student._id == _id
        })
    }
}