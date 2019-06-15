import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'
import { Observable, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class MediaService {
  private imageService: string = '//grapple-dev.edji.it'
  private pdfBucket: string = '//image-dev.edji.it/pdf'

  constructor(private http: Http) {
    // Check to see if prod or dev environment
    if (window.location.host.indexOf('dev.edji.it') > -1) {
      this.imageService = '//grapple-dev.edji.it'
      this.pdfBucket = '//image-dev.edji.it/pdf'
    } else if (
      window.location.host.indexOf('edji.it') > -1 ||
      window.location.host.indexOf('dvscf5tf91syg.cloudfront.net') > -1
    ) {
      this.imageService = '//grapple.edji.it'
      this.pdfBucket = '//image.edji.it/pdf'
    }
  }

  // Upload an image to the bucket to be locally stored.
  uploadImage(file: File): Observable<any> {
    let uploadSource = new Subject()
    this.http.get(this.imageService + '/sign-s3?file-name=' + file.name + '&file-type=' + file.type).subscribe(
      res => {
        let s3data = res.json()

        this.http.put(s3data.signedRequest, file).subscribe(
          res => {
            uploadSource.next({ url: s3data.url })
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
  } // uploadImage(file: File): Observable<any>

  uploadAudio(formData: any): Observable<any> {
    let uploadSource = new Subject()
    let type = 'audio/wav'
    let name = 'my-audio.wav'
    // let type = 'audio/aac'
    // let name = 'my-audio.aac'

    this.http
      .get(this.imageService + '/sign-s3?file-name=' + name + '&file-type=' + type + '&file-path=audio')
      .subscribe(
        res => {
          let s3data = res.json()

          this.http.put(s3data.signedRequest, formData).subscribe(
            res => {
              uploadSource.next({ url: s3data.url })
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

  uploadAvatar(file: File): Observable<any> {
    let uploadSource = new Subject()
    this.http
      .get(this.imageService + '/sign-s3?file-name=' + file.name + '&file-type=' + file.type + '&file-path=avatars')
      .subscribe(
        res => {
          let s3data = res.json()

          this.http.put(s3data.signedRequest, file).subscribe(
            res => {
              uploadSource.next({ url: s3data.url })
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

  uploadPdf(file: File, disableOCR: boolean): Observable<any> {
    /**
     * @todo 6/15/19 update service to accept boolean for enable OCR
     * enableOCR will tell our service whether or not to use the OCR service on the PDF.. need to update our service call for this one
     */
    let uploadSource = new Subject()
    let ocrQueryParam: string = '?ocr=true'

    if (disableOCR) {
      ocrQueryParam = '?ocr=false'
    }

    this.http.put(`${this.imageService}/v1/pdf${ocrQueryParam}`, file).subscribe(
      res => {
        let doc = res.json() || {}
        uploadSource.next(doc)
      },
      error => {
        uploadSource.error(error)
      },
    )

    return uploadSource.asObservable()
  }

  pdfCheck(fileId: string): Observable<any> {
    return this.http.get(this.pdfBucket + '/' + fileId + '/spark.json').pipe(
      map(data => {
        return data.json() || {}
      }),
    )
  } // pdfCheck(fileId: string): Observable<any>
} // class
