import { Injectable } from '@angular/core'
import { Locker, DRIVERS } from 'angular-safeguard'
import * as Airtable from 'airtable'
import { Observable, of, BehaviorSubject } from 'rxjs'
import { AuthService } from '.'

/**
 * Localstorage wrapper
 * - Uses Angular Safeguard
 * - Provides the cleanest interface possible and consolidates storage configuration (eg. using LOCAL)
 */
@Injectable({
  providedIn: 'root',
})
export class CopyService {
  private base
  private _airtable

  // Promo Copy Observable
  private activePromotionSubj: BehaviorSubject<PromoCopy> = new BehaviorSubject({})
  public activePromotions: Observable<PromoCopy> = this.activePromotionSubj.asObservable()

  constructor(private _auth: AuthService) {
    let env = this._auth.getEnv()
    this._airtable = Airtable

    this._airtable.configure({
      apiKey: 'keypBiIZw05gzqcD5',
    })

    // Copy Management Base
    this.base = this._airtable.base('appYs5u4FfbKNkcX5')

    // Fetch promotion copy base
    this.base('Promo Copy')
      .select({
        view: 'List',
      })
      .firstPage((err, records) => {
        if (err) {
          console.error(err)
          return
        }
        records.forEach(record => {
          let promotion = record.fields
          if (promotion.live && promotion.live.indexOf(env) >= 0) {
            this.activePromotionSubj.next(promotion)
          }
        })
      })
  }
}

export interface PromoCopy {
  promotionTitle?: string
  heading?: string
  subheading?: string
  graphic?: {
    filename: string
    id: string
    size: number
    thumbnails: {
      small: { url: string }
      large: { url: string }
      full: { url: string }
    }
    type: string
    url: string
  }[]
  live?: string[] // dev or prod
  link?: string // url
  linkText?: string
  offerDetails?: string
  toastMessage?: string
}
