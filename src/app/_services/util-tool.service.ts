import { Injectable } from '@angular/core'

const { version: appVersion } = require('../../../package.json')

@Injectable()
export class UtilToolService {
  public showFeedbackModal: boolean
  public showShareCode: boolean
  public appVersion: string
  public iOS: boolean

  constructor() {
    // Get version number
    this.appVersion = appVersion
    this.iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)
  }

  /**
   * Return the current platform of the user
   */
  public getPlatform(sUsrAg): string {
    return sUsrAg.platform
  }

  /**
   * Return the current browser of the user
   */
  public getBrowser(sUsrAg): string {
    if (sUsrAg.indexOf('Chrome') > -1) {
      return 'Google Chrome'
    } else if (sUsrAg.indexOf('Safari') > -1) {
      return 'Apple Safari'
    } else if (sUsrAg.indexOf('Opera') > -1) {
      return 'Opera'
    } else if (sUsrAg.indexOf('Firefox') > -1) {
      return 'Mozilla Firefox'
    } else if (sUsrAg.indexOf('MSIE') > -1) {
      return 'Microsoft Internet Explorer'
    }
  }

  /**
   * Return the current browser version of the user
   */
  public getBrowserVersion(sUsrAg): string {
    var M, temp

    M = sUsrAg.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []

    if (/trident/i.test(M[1])) {
      temp = /\brv[ :]+(\d+)/g.exec(sUsrAg) || []
      return 'IE ' + (temp[1] || '')
    }

    if (M[1] === 'Chrome') {
      temp = sUsrAg.match(/\b(OPR|Edge)\/(\d+)/)
      if (temp != null)
        return temp
          .slice(1)
          .join(' ')
          .replace('OPR', 'Opera')
    }

    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?']

    if ((temp = sUsrAg.match(/version\/(\d+)/i)) != null) M.splice(1, 1, temp[1])

    return M.join(' ')
  }

  /**
   * Return the current Edji version of the user
   */
  public getEdjiVersion(): string {
    return this.appVersion
  }

  /**
   * Reset the share code object and close the modal
   */
  public shareCodeModalClose(): void {
    this.showShareCode = false
  }
}
