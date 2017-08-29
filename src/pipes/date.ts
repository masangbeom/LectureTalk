import { Injectable, Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'DateFormat'
})
@Injectable()
export class DateFormatPipe implements PipeTransform {
  // DateFormatPipe
  // moment.js 를 통한 Pipe
  transform(date: any, args?: any): any {
    
    return moment(new Date(date)).locale('ko').fromNow();
  }
}
