import { Component, Input, OnInit } from '@angular/core'

import { EdjiComment } from '../../shared/datatypes'

@Component({
    selector: 'audio-comment',
    templateUrl: 'audio-comment.component.html',
    styleUrls: ['./audio-comment.component.scss']
})
export class AudioCommentComponent implements OnInit{
    @Input() private comment: EdjiComment
    private isPlaying: boolean = false
    private isRecording: boolean = false
    private playTime: string = "75px"
    private myCanvas
    private options
    private canvas
    private ctx
    private colors
    
    constructor() { 
        
    }
    
    ngOnInit() {
        // Set the canvas properties and write temporary data
        var waves = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,12,14,22,32,10,12,28,46,89,10,12,14,22,32,10,12,28,46,89,10,12,14,22,32,10,12,28,46,89,0,0,0,0,0,0,0,0,0,0]
        this.myCanvas = document.getElementById("myCanvas")

        // Build the waveform
        this.waveForm(waves, this.myCanvas)
    }

    private loadAudio() {
        
    }

    private waveForm(waves, canvas) {
        // Prepare the canvas
        this.ctx = canvas.getContext("2d")

        // Set the properties for this waveform and write it in the barchart function
        barchart(
            {
                canvas: canvas,
                padding:2,
                gridScale:5,
                gridColor:"transparent",
                data: waves,
                colors:["#000"],
                ctx: this.ctx
            }
        )
        
        // Write the waveform in a barchart style
        function barchart(options){
            var maxValue = 0

            for (var bar in options.data){
                maxValue = Math.max(maxValue,options.data[bar])
            }
            var canvasActualHeight = options.canvas.height - options.padding * 2
            var canvasActualWidth = options.canvas.width - options.padding * 2
    
            //drawing the bars
            var barIndex = 0
            var numberOfBars = Object.keys(options.data).length
            var barSize = (canvasActualWidth)/numberOfBars

            for (bar in options.data){
                var val = options.data[bar]
                if (val===0) {
                    val = 2
                }
                var barHeight = Math.round( canvasActualHeight * val/maxValue) 
                drawBar(
                    options.ctx,
                    options.padding + barIndex * barSize,
                    options.canvas.height/2,
                    barSize,
                    barHeight,
                    options.colors[barIndex%options.colors.length]
                )
                barIndex++
            }
        }

        // Draw the individual bar at the specific part of chart with the specific height. It will be mirrored vertically about the middle of the chart
        function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height,color){
            ctx.save()
            ctx.fillStyle=color
            ctx.fillRect(upperLeftCornerX,upperLeftCornerY - height,width,2*height)
            ctx.restore()
        }
    }
}