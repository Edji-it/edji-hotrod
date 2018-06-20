/**
 * Audio Service
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Implemented to share:
 * - Single instance of Audio player
 * - Single instance of Recorder.js
 * Purpose:
 * - Safari limits the number of audio contexts that can load at once
 * - Browsers request access to the microphone for every Recorder initiated
 */
import { Injectable } from '@angular/core';
import * as Recorder from 'opus-recorder/dist/recorder.min.js'
import { Observable, Subject } from 'rxjs';

@Injectable()
export class AudioService {
    
    public recorder

    // Indiactes either playback or recording has started
    public audioInitSubject: Subject<string> = new Subject()
    public audioInitiated: Observable<any> = this.audioInitSubject.asObservable()

    constructor() {}

    public initializeAudio(): void {
        if (Recorder.isRecordingSupported()) {
            this.recorder = new Recorder({
                // Chrome does NOT like 'x-wav' mime type
                type: 'audio/wav',
                // Safari only plays well with the waveWorker
                encoderPath: '/assets/js/waveWorker-1.4.1.min.js',
                // We process chunks of data as we go (see: dataAvailable event)
                streamPages: true
            })
        }
    }

    public isSupported(): boolean {
        return Recorder.isRecordingSupported()
    }

    public freshRecorder(): void {
        this.recorder.clearStream()

        // iOS Safari fix
        this.recorder.resume()
    }

    public addRecorderListener(event: string, listener: Function): void {
        this.recorder['on'+event] = listener
    }

    public shutRecorderDown() {
        if (typeof(this.recorder)!=='undefined') {
            this.recorder.clearStream()
            this.recorder = undefined
        }
    }

    public signalAudioInitiated(commentId: string) : void {
        this.audioInitSubject.next(commentId)
    }
}