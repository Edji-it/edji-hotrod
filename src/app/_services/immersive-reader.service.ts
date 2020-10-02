import { Injectable } from '@angular/core'
import { AuthService } from './auth.service'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Angulartics2 } from 'angulartics2'
import { StateService } from './state.service'

declare const ImmersiveReader: any

@Injectable()
export class ImmersiveReaderService {
  private storedReaderState: {
    preferences: string
  } = null
  private preferencesKey = 'immersive_reader'

  constructor(
    private _http: HttpClient,
    private angulartics: Angulartics2,
    private _auth: AuthService,
    private _state: StateService,
  ) {}

  async ensureState() {
    this.storedReaderState = await this._state.getState(this.preferencesKey).toPromise()
  }

  savePreferences() {
    return this._state
      .setState(this.preferencesKey, this.storedReaderState)
      .toPromise()
      .catch(err => console.error(err))
  }

  onPreferencesChanged(value: string) {
    this.storedReaderState.preferences = value
  }

  async startImmersiveReader(data: any, passedOptions: any): Promise<void> {
    if (!this.storedReaderState) {
      await this.ensureState()
    }
    const defaultOptions = {
      uiLang: 'en-US',
      uiZIndex: 8000,
      preferences: this.storedReaderState.preferences,
      onPreferencesChanged: value => {
        this.storedReaderState.preferences = value
      },
    }
    const options = { ...defaultOptions, ...passedOptions }
    return this._http
      .get<immersiveReaderResponse>(`${this._auth.getUrl()}/api/v1/auth/azure/immersive_reader`, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this._auth.getToken(),
        }),
      })
      .toPromise()
      .then(({ access_token, subdomain }) => {
        ImmersiveReader.launchAsync(access_token, subdomain, data, options)
      })
  }
}

type immersiveReaderResponse = { access_token: string; subdomain: string }
