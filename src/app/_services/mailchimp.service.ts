import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

// Project Dependencies
import { AuthService } from '.'
import { User } from './../shared/datatypes'

@Injectable()
export class MailchimpService {
  private isProd: boolean = true
  constructor(private _auth: AuthService, private _http: HttpClient) {
    this.isProd = _auth.getEnv() === 'prod'
  }

  makeChimpUser(user: User): { email: string; fname: string; lname: string } {
    let spaceIndex = user.fullname.indexOf(' ')
    if (spaceIndex < 0) spaceIndex = user.fullname.length
    return {
      email: user.email,
      fname: user.fullname.substr(0, spaceIndex),
      lname: user.fullname.substr(spaceIndex + 1),
    }
  }

  /**
   * Add users who subscribe to Hero to the Mailchimp Hero Subscribed list
   */
  async addToActiveHeroList(user: User): Promise<void> {
    if (this.isProd) {
      let body: MailChimpPost = {
        ...this.makeChimpUser(user),
        list: 'hero-subscribed',
      }
      await this._http.post(this._auth.getUrl() + '/mailchimp/add', body, this._auth.getOptions()).toPromise()
    } else {
      console.info('Dev: Not adding user to Active Hero List')
    }
  }

  /**
   * Add newly registered users to the sign up Mailchimp list
   */
  public async addToNewUsersList(user: User): Promise<void> {
    if (this.isProd) {
      let body: MailChimpPost = {
        ...this.makeChimpUser(user),
        list: 'new',
      }
      await this._http.post(this._auth.getUrl() + '/mailchimp/add', body, this._auth.getOptions()).toPromise()
    } else {
      console.info('Dev: Not adding user to mailing list')
    }
  }
}

interface MailChimpPost {
  email: string
  fname: string
  lname: string
  list: string
}
