import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchLectureFilter'
})
@Injectable()
export class SearchLecturePipe implements PipeTransform {
  //Search Lecture Pipe
  transform(lectures: any[], data: [[any], any]): any {
    let excludedIds = data[0];
    var term: string = data[1];
    if (!lectures) {
      return;
    } else if (!excludedIds) {
      return lectures;
    } else if (excludedIds && !term) {
      return lectures.filter((lecture) => excludedIds.indexOf(lecture.lectureId) == -1);
    } else {
      term = term.toLowerCase();
      return lectures.filter((lecture) => excludedIds.indexOf(lecture.lectureId) == -1 && (lecture.className.toLowerCase().indexOf(term) > -1 ));
    }
  }
}
