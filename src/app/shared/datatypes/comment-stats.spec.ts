import { CommentStats } from './comment-stats'

const mockProject: any = {
  _id: '5e19f05bc309d40033b204c2',
  co_owner_ids: ['5e07a6702eab64002c32b1a4'],
  students_ids: ['5e07a6702eab64002c32b1a4'],
  temp_ids: ['5e19f175e37fc1002cf230cd', '5e19f22ce37fc1002cf230ea', '5e19f241c309d40033b204da'],
  types: ['emoji', 'text', 'audio', 'reply'],
  heat_vision: true,
  label: 'Group 1',
  code: 'p1r7',
  group_instructions: 'Read about science and learn stuff',
  reading_id: {
    _id: '5e19f030e37fc1002cf230bd',
    words: [{ str: '1', styles: ['h3'] }, { str: '.', styles: ['h3'] }, {}, { str: 'Silicon', styles: ['h3'] }],
    title: "Science Stuff and REE's",
    owner_id: '59bd8ff45239f3001105dba8',
    reading_type: 'private',
    promoter_ids: [],
    source: null,
    tags: [],
    draft: false,
    version_id: '5e19f030e37fc1002cf230be',
    questions: [
      {
        type: 'open-ended',
        answer_types: ['emoji', 'text', 'audio'],
        option_types: [],
        _id: '5e19f05be37fc1002cf230c2',
        prompt: 'Do you like science?',
        createdAt: '2020-01-11T15:57:15.605Z',
        updatedAt: '2020-01-11T15:57:15.605Z',
      },
      {
        type: 'open-ended',
        answer_types: ['audio'],
        option_types: [],
        _id: '5e19f05be37fc1002cf230c1',
        prompt: 'What kind of science do you do?',
        createdAt: '2020-01-11T15:57:15.604Z',
        updatedAt: '2020-01-11T15:57:15.604Z',
      },
    ],
    parent_id: '5cf71a0c593f5c0021b59253',
    createdAt: '2020-01-11T15:57:13.651Z',
  },
  teacher_id: '59bd8ff45239f3001105dba8',
  owner_id: '59bd8ff45239f3001105dba8',
  comments: [
    {
      start: 5,
      end: 42,
      dataArray: [],
      replies: ['5e19f25ac309d40033b204db'],
      _id: '5e19f09ae37fc1002cf230c7',
      createdAt: '2020-01-11T15:58:18.806Z',
      updatedAt: '2020-01-11T15:58:27.771Z',
      data: 'Space: the Final Frontier',
      type: 'text',
      text: 'We have plenty of silicon on Earth, but that doesn’t mean it won’t be useful in space',
      user_id: '59bd8ff45239f3001105dba8',
      author: 'corbin',
    },
    {
      start: 86,
      end: 102,
      dataArray: [],
      replies: ['5e19f268e37fc1002cf230eb'],
      _id: '5e19f17ee37fc1002cf230ce',
      createdAt: '2020-01-11T16:02:06.732Z',
      updatedAt: '2020-01-11T16:02:12.113Z',
      data: 'Moon dirt :fire:',
      type: 'text',
      text: 'The stuff makes up 20 percent of moon dirt',
      user_id: '5e19f175e37fc1002cf230cd',
      author: 'Rare Earth Lover',
    },
    {
      start: 128,
      end: 134,
      dataArray: [],
      replies: [],
      _id: '5e19f198c309d40033b204ce',
      createdAt: '2020-01-11T16:02:32.463Z',
      updatedAt: '2020-01-11T16:02:49.507Z',
      data: 'Conductive metals are electric',
      type: 'text',
      text: '17 highly conductive metals',
      user_id: '5e19f175e37fc1002cf230cd',
      author: 'Rare Earth Lover',
    },
    {
      start: 184,
      end: 188,
      dataArray: [75, 254, 251, 164],
      replies: [],
      _id: '5e19f1c0e37fc1002cf230da',
      createdAt: '2020-01-11T16:03:12.494Z',
      updatedAt: '2020-01-11T16:03:22.497Z',
      data: '',
      type: 'audio',
      text: 'host REE mines',
      user_id: '5e19f175e37fc1002cf230cd',
      author: 'Rare Earth Lover',
      url: '//image-dev.edji.it/audio/72a069e2-e7e1-4d26-a0c2-dda72034367b.wav',
    },
    {
      start: -1,
      end: -1,
      dataArray: [],
      replies: [],
      _id: '5e19f25ac309d40033b204db',
      createdAt: '2020-01-11T16:05:46.907Z',
      updatedAt: '2020-01-11T16:05:52.382Z',
      user_id: '5e19f241c309d40033b204da',
      author: 'Only replies',
      reply_to: '5e19f09ae37fc1002cf230c7',
      data: 'I think space is my favorite frontier',
      type: 'text',
    },
    {
      start: -1,
      end: -1,
      dataArray: [],
      replies: [],
      _id: '5e19f268e37fc1002cf230eb',
      createdAt: '2020-01-11T16:06:00.806Z',
      updatedAt: '2020-01-11T16:06:12.713Z',
      user_id: '5e19f241c309d40033b204da',
      author: 'Only replies',
      reply_to: '5e19f17ee37fc1002cf230ce',
      data: 'Moon dirt is dry',
      type: 'text',
    },
  ],
  answers: [
    {
      start: -1,
      end: -1,
      dataArray: [],
      replies: [],
      _id: '5e19f1d5c309d40033b204d3',
      createdAt: '2020-01-11T16:03:33.022Z',
      updatedAt: '2020-01-11T16:04:16.026Z',
      data: ':volcano:',
      type: 'emoji',
      author: 'Rare Earth Lover',
      user_id: '5e19f175e37fc1002cf230cd',
      questionId: '5e19f05be37fc1002cf230c2',
    },
    {
      start: -1,
      end: -1,
      dataArray: [75, 238, 0, 85],
      replies: [],
      _id: '5e19f204c309d40033b204d6',
      createdAt: '2020-01-11T16:04:20.218Z',
      updatedAt: '2020-01-11T16:04:29.195Z',
      data: '',
      type: 'audio',
      author: 'Rare Earth Lover',
      user_id: '5e19f175e37fc1002cf230cd',
      questionId: '5e19f05be37fc1002cf230c1',
      url: '//image-dev.edji.it/audio/94afbc0a-9a8d-44d8-b4e9-c994bc0a71ff.wav',
    },
    {
      start: -1,
      end: -1,
      dataArray: [],
      replies: [],
      _id: '5e19f285e37fc1002cf230f9',
      createdAt: '2020-01-11T16:06:29.845Z',
      updatedAt: '2020-01-11T16:06:33.293Z',
      data: 'No',
      type: 'text',
      author: 'Only replies',
      user_id: '5e19f241c309d40033b204da',
      questionId: '5e19f05be37fc1002cf230c2',
    },
  ],
  temps: [
    { _id: '5e19f175e37fc1002cf230cd', fullname: 'Rare Earth Lover', userType: 'temp' },
    { _id: '5e19f22ce37fc1002cf230ea', fullname: 'Bored Student', userType: 'temp' },
    { _id: '5e19f241c309d40033b204da', fullname: 'Talky talk', userType: 'temp' },
  ],
  students: [
    {
      _id: '5e07a6702eab64002c32b1a4',
      fullname: 'Corbin Fonville',
      avatar: '#546DF2',
      initials: ':vulcan:',
      hero_status: true,
      userType: 'registered',
    },
  ],
  report_evals: [],
  feedback: [],
  tags: [],
  outcomes: [],
  createdAt: '2020-01-11T15:57:15.480Z',
  updatedAt: '2020-01-11T15:57:15.502Z',
  __v: 0,
  teacher: {
    _id: '59bd8ff45239f3001105dba8',
    fullname: 'corbin',
    username: 'corbin',
    initials: 'c',
    hero_status: true,
  },
  co_owners: [
    {
      _id: '5e07a6702eab64002c32b1a4',
      fullname: 'Corbin Fonville',
      hero_status: true,
    },
  ],
  owners: [
    {
      _id: '59bd8ff45239f3001105dba8',
      fullname: 'corbin',
      username: 'corbin',
      initials: 'c',
      hero_status: true,
    },
  ],
}

describe('class CommentStats', () => {
  describe('constructor', () => {
    it('should generate comment stats given a project', () => {
      const stats = new CommentStats(mockProject)
      expect(stats.teacherId).toEqual(mockProject.teacher_id)
      expect(stats.stats.reply_count).toEqual(2)
      expect(stats.stats.comment_count).toEqual(4)
      expect(stats.stats.student_comments).toEqual(3)
      expect(stats.stats.comment_max).toEqual(3)
      expect(stats.stats.comment_min).toEqual(0)
      expect(stats.stats.comment_avg).toEqual(1)
      expect(stats.stats.userStats[0]).toMatchObject({
        _id: '5e19f175e37fc1002cf230cd',
        comment_count: 3,
        reply_count: 0,
        emoji_comment_count: 0,
        text_comment_count: 2,
        audio_comment_count: 1,
        questions: [
          { _id: '5e19f05be37fc1002cf230c2', answered: true },
          { _id: '5e19f05be37fc1002cf230c1', answered: true },
        ],
        status: 'offline',
      })
      const teacher = stats.stats.userStats.find(user => user._id === stats.teacherId)
      expect(teacher).toBeUndefined()
    })

    it('should return default stats', () => {
      const stats = new CommentStats()
      expect(stats.teacherId).toBeUndefined()
      expect(stats.stats.reply_count).toEqual(0)
      expect(stats.stats.comment_count).toEqual(0)
      expect(stats.stats.comment_max).toEqual(0)
      expect(stats.stats.comment_min).toEqual(0)
      expect(stats.stats.comment_avg).toEqual(0)
      expect(stats.stats.userStats).toHaveLength(0)
    })
  })

  describe('findStudent', () => {
    it('should return the student', () => {
      const studentId = '5e07a6702eab64002c32b1a4'
      const stats = new CommentStats(mockProject)
      const student = stats.findStudent(studentId)
      expect(student).toMatchObject({
        _id: studentId,
      })
    })
  })

  describe('setUserStatus', () => {
    it('should change a users status', () => {
      const studentId = '5e19f175e37fc1002cf230cd'
      const stats = new CommentStats(mockProject)
      stats.setUserStatus(studentId, 'active')
      const user = stats.findStudent(studentId)
      expect(user.status).toEqual('active')
    })
  })

  describe('processComments', () => {
    it('should reprocess comments for a project that is already created', () => {
      // reprocessing the same project twice should yeild the same results
      const stats = new CommentStats(mockProject)
      stats.processComments(mockProject)
      expect(stats.teacherId).toEqual(mockProject.teacher_id)
      expect(stats.stats.reply_count).toEqual(2)
      expect(stats.stats.comment_count).toEqual(4)
      expect(stats.stats.student_comments).toEqual(3)
      expect(stats.stats.comment_max).toEqual(3)
      expect(stats.stats.comment_min).toEqual(0)
      expect(stats.stats.comment_avg).toEqual(1)
      expect(stats.stats.userStats[0]).toMatchObject({
        _id: '5e19f175e37fc1002cf230cd',
        comment_count: 3,
        reply_count: 0,
        emoji_comment_count: 0,
        text_comment_count: 2,
        audio_comment_count: 1,
        questions: [
          { _id: '5e19f05be37fc1002cf230c2', answered: true },
          { _id: '5e19f05be37fc1002cf230c1', answered: true },
        ],
        status: 'offline',
      })
      const teacher = stats.stats.userStats.find(user => user._id === stats.teacherId)
      expect(teacher).toBeUndefined()
    })
    it('should preserve student statuses if reprocessed', () => {
      const studentId = '5e07a6702eab64002c32b1a4'
      const stats = new CommentStats(mockProject)
      expect(stats.stats.userStats.find(s => s._id === studentId).status).toEqual('offline')
      stats.setUserStatus(studentId, 'active')
      expect(stats.stats.userStats.find(s => s._id === studentId).status).toEqual('active')
      stats.processComments(mockProject)
      expect(stats.stats.userStats.find(s => s._id === studentId).status).toEqual('active')
    })
  })
})
