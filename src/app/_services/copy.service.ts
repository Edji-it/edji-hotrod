import { Injectable } from '@angular/core'
import { Locker, DRIVERS } from 'angular-safeguard'
import * as Airtable from 'airtable'

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

  constructor() {
    this._airtable = Airtable

    this._airtable.configure({
      apiKey: 'keypBiIZw05gzqcD5',
    })

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
        records.forEach(function(record) {
          let promotion = record.fields
          console.log(promotion)
          if (promotion.active) {
            console.log(promotion)
          }
        })
      })
  }
}

export interface PromoCopy {
  promotionTitle: string
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
  active?: boolean
}
