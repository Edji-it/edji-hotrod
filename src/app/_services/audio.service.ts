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

@Injectable()
export class AudioService {
    
    public recorder

    constructor() {}

    public initializeAudio(): void {
        if (Recorder.isRecordingSupported()) {
            this.recorder = new Recorder({
                // Chrome does NOT like 'x-wav' mime type
                type: 'audio/wav',
                // Safari only plays well with the waveWorker
                encoderPath: '/assets/js/waveWorker.min.js',
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
        console.log("Shut audio down!")
        if (typeof(this.recorder)!=='undefined') {
            this.recorder.clearStream()
            this.recorder = undefined
        }
    }
}