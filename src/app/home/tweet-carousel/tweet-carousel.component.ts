import { Component, OnInit, ViewEncapsulation } from '@angular/core'

import * as Fetcher from './twitter-fetcher.js'

@Component({
  selector: 'edji-tweet-carousel',
  styleUrls: ['./tweet-carousel.component.scss'],
  templateUrl: './tweet-carousel.component.pug',
  encapsulation: ViewEncapsulation.None, // enable overwriting embedded html
})
export class TweetCarouselComponent implements OnInit {
  public tweets: string[] = ['']
  public tweetIndex: number = 0

  constructor() {}

  ngOnInit() {
    let configList = {
      // id: '947890483635851267',
      // list: { listSlug: 'inspiration', screenName: 'edjinotes' },
      likes: { screenName: 'edjinotes' },
      domId: 'twitterShowcase',
      maxTweets: 10,
      enableLinks: true,
      showUser: true,
      showRetweet: false,
      // showTime: true,
      targetBlank: true,
      showImages: true,
      lang: 'en',
      dataOnly: true,
      customCallback: (data: any) => {
        console.log(data)
        data.forEach(tweet => {
          tweet.tweet = tweet.tweet.replace(new RegExp('href="', 'g'), 'target="_blank" href="')
        })
        this.tweets = data
      },
    }
    Fetcher.fetch(configList)
  }

  pageTweets(change: number) {
    this.tweetIndex += change
    if (this.tweetIndex >= this.tweets.length) {
      this.tweetIndex = 0
    }
    if (this.tweetIndex < 0) {
      this.tweetIndex = this.tweets.length - 1
    }
  }
}
