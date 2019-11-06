import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core'

import * as Fetcher from './twitter-fetcher.js'
import { interval, Subscription } from 'rxjs'

@Component({
  selector: 'edji-tweet-carousel',
  styleUrls: ['./tweet-carousel.component.scss'],
  templateUrl: './tweet-carousel.component.pug',
  encapsulation: ViewEncapsulation.None, // enable overwriting embedded html
})
export class TweetCarouselComponent implements OnInit, OnDestroy {
  public tweets: string[] = ['']
  public tweetIndex: number = 0
  public tweetInterval: Subscription
  public recentlyPaged: boolean = false

  constructor() {}

  ngOnInit() {
    let configList = {
      // id: '947890483635851267',
      // list: { listSlug: 'inspiration', screenName: 'edjinotes' },
      collection: { collection_id: '947890483635851267' },
      // likes: { screenName: 'edjinotes' },
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
          tweet.author = tweet.author.replace(new RegExp('href="', 'g'), 'target="_blank" href="')
        })
        this.displayTweets(data)
      },
    }
    Fetcher.fetch(configList)
  }

  ngOnDestroy() {
    if (this.tweetInterval) {
      this.tweetInterval.unsubscribe()
    }
  }

  pageTweets(change: number, auto?: boolean) {
    this.recentlyPaged = !auto
    this.tweetIndex += change
    if (this.tweetIndex >= this.tweets.length) {
      this.tweetIndex = 0
    }
    if (this.tweetIndex < 0) {
      this.tweetIndex = this.tweets.length - 1
    }
  }

  displayTweets(tweets: any[]): void {
    this.tweets = tweets
    if (this.tweetInterval) {
      this.tweetInterval.unsubscribe()
    }
    let secondsCounter = interval(4000)
    // Subscribe to begin publishing values
    this.tweetInterval = secondsCounter.subscribe(n => {
      // Skip one interval if recently paged
      if (!this.recentlyPaged) {
        this.pageTweets(1, true)
      }
      this.recentlyPaged = false
    })
  }
}
