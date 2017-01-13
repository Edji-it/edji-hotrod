import { Injectable } from '@angular/core';

import { AuthService } from '.';

@Injectable()
export class BumblebeeService {

  constructor(private _auth: AuthService) {
    
  }
}