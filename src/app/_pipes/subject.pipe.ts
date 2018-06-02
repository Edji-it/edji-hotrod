import { Pipe, PipeTransform } from '@angular/core'

@Pipe({name: 'subjectName'})
export class SubjectPipe implements PipeTransform {
  private subjectMap  = {
    'literature': 'Language Arts',
    'math': 'Mathematics',
    'science': 'Science',
    'geography': 'Geography',
    'history': 'History',
    'government': 'Government',
    'health': 'Health',
    'languages': 'Foreign Languages',
    'art': 'Art',
    'computer': 'Computers/Technical'
  }

  transform(str: string): string {
    return this.subjectMap[str] ? this.subjectMap[str] : str
  }
}
