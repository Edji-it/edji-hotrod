import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

// Project Dependencies
import { AuthService } from '.'
import { DocumentSpark, DocumentAnalysisData } from '../shared/datatypes'

@Injectable()
export class MediaService {
  private imageService: string = '//grapple-dev.edji.it'
  private pdfBucket: string = '//image-dev.edji.it/documents'
  private flakUrl: string = '//flak-dev.edji.it'

  constructor(private _http: HttpClient, private _auth: AuthService) {
    // Check to see if prod or dev environment
    if (window.location.host.indexOf('dev.edji.it') > -1) {
      this.imageService = '//grapple-dev.edji.it'
      this.pdfBucket = '//image-dev.edji.it'
      this.flakUrl = '//flak-dev.edji.it'
    } else if (
      window.location.host.indexOf('edji.it') > -1 ||
      window.location.host.indexOf('dvscf5tf91syg.cloudfront.net') > -1
    ) {
      this.imageService = '//grapple.edji.it'
      this.pdfBucket = '//image.edji.it'
      this.flakUrl = '//flak.edji.it'
    }
  }

  // Upload an image to the bucket to be locally stored.
  public uploadImage(file: File): Observable<any> {
    let uploadSource = new Subject()
    this._http.get(this.imageService + '/sign-s3?file-name=' + file.name + '&file-type=' + file.type).subscribe(
      res => {
        let s3data = res

        this._http.put(s3data['signedRequest'], file).subscribe(
          res => {
            uploadSource.next({ url: s3data['url'] })
          },
          error => {
            uploadSource.error(error)
          },
        )
      },
      error => {
        uploadSource.error(error)
      },
    )

    return uploadSource.asObservable()
  }

  public uploadAudio(formData: any): Observable<any> {
    let uploadSource = new Subject()
    let type = 'audio/wav'
    let name = 'my-audio.wav'
    // let type = 'audio/aac'
    // let name = 'my-audio.aac'

    this._http
      .get(this.imageService + '/sign-s3?file-name=' + name + '&file-type=' + type + '&file-path=audio')
      .subscribe(
        res => {
          let s3data = res

          this._http.put(s3data['signedRequest'], formData).subscribe(
            res => {
              uploadSource.next({ url: s3data['url'] })
            },
            error => {
              uploadSource.error(error)
            },
          )
        },
        error => {
          uploadSource.error(error)
        },
    )

    return uploadSource.asObservable()
  }

  public uploadAvatar(file: File): Observable<any> {
    let uploadSource = new Subject()
    this._http
      .get(this.imageService + '/sign-s3?file-name=' + file.name + '&file-type=' + file.type + '&file-path=avatars')
      .subscribe(
        res => {
          let s3data = res

          this._http.put(s3data['signedRequest'], file).subscribe(
            res => {
              uploadSource.next({ url: s3data['url'] })
            },
            error => {
              uploadSource.error(error)
            },
          )
        },
        error => {
          uploadSource.error(error)
        },
    )

    return uploadSource.asObservable()
  }

  /**
   * Upload PDF
   * - Gets signed URL from Flak, then begins uploading PDF
   * @param file PDF to upload
   */
  public uploadPdf(file: File): Observable<any> {
    let uploadSource = new Subject()
    this._http.get(this.flakUrl + '/storage/signed_url?file_name=' + file.name).subscribe(
      (s3data: { signed_request: string; url: string }) => {
        let putUrl = s3data.signed_request.replace('https://', '//')
        this._http.put(putUrl, file).subscribe(
          res => {
            uploadSource.next(s3data)
          },
          error => {
            uploadSource.error(error)
          },
        )
      },
      error => {
        uploadSource.error(error)
      },
    )

    return uploadSource.asObservable()
  }

  public getDocumentSpark(fileId: string, hostname?: string): Observable<DocumentSpark> {
    if (!hostname) {
      hostname = this.pdfBucket
    }
    return this._http.get(hostname + '/' + fileId + '/spark.json').pipe(
      map(data => {
        return <DocumentSpark>data
      }),
    )
  }

  /**
   * Returns a JSON object of the PDF from OCR Service
   * @param url location of the PDF OCR JSON data (lot of acronyms in a row there)
   */
  public getDocumentData(url: string): Observable<DocumentAnalysisData> {
    // , this._auth.getOptions()
    return this._http.get(url).pipe(
      map(data => {
        return <DocumentAnalysisData>data
      }),
    )
  }
}
