import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, Subject } from 'rxjs/Rx';

@Injectable()
export class MediaService {

    private imageService: string = '//grapple-dev.edji.it';
    private pdfService: string = '//sunstreaker.edji.it';

    constructor(private http: Http) { 
        // Check to see if prod or dev environment
        if (window.location.host.indexOf('dev.edji.it') > -1) {
            this.imageService = '//grapple-dev.edji.it';
        } else if (window.location.host.indexOf('edji.it') > -1 || window.location.host.indexOf('dvscf5tf91syg.cloudfront.net') > -1) {
            this.imageService = '//grapple.edji.it';
        }
    }

    uploadImage(file: File): Observable<any> {
        let uploadSource = new Subject();
        this.http.get(this.imageService + '/sign-s3?file-name=' + file.name + '&file-type=' + file.type)
            .subscribe((res) => {
                let s3data = res.json();
                
                this.http.put(s3data.signedRequest, file)
                    .subscribe(res => {
                        uploadSource.next({ url: s3data.url });
                    }, error => {
                        uploadSource.error(error);
                    });
            },
            (error) => {
                uploadSource.error(error);
            }
        );

        return uploadSource.asObservable();
    }

    uploadPdf(file: File): Observable<any> {
        let uploadSource = new Subject();
     
        this.http.put(this.pdfService + '/v1/pdf', file )
            .subscribe(res => {
                let doc = res.json() || {};
                uploadSource.next(doc);
            }, error => {
                uploadSource.error(error);
            });

        return uploadSource.asObservable();
    }

    
}