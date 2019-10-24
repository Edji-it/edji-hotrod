import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'edji-badge-row',
    templateUrl: './badge-row.component.pug',
    styleUrls: ['./badge-row.component.scss'],
  })
  export class BadgeRowComponent implements OnInit {

    public badges = [
        {
            name:'AWS EdStart Member',
            logo:'/assets/images/promo/logo--aws-edstart.png',
            link:'https://aws.amazon.com/education/edstart'
        },
        {
            name:'Clever Featured Application',
            logo:'/assets/images/promo/logo--clever.png',
            link:'https://blog.clever.com/2019/04/classroom-reading-made-social-with-edji/'
        },
        {
            name:'MN Cup Semifinalist',
            logo:'/assets/images/promo/logo--mn-cup.png',
            link:'https://carlsonschool.umn.edu/mn-cup/the-competition/semifinalists'
        },
        {
            name:'Startup Weekend Edu Finalist',
            logo:'/assets/images/promo/logo--startup-weekend.png',
            link:'http://communities.techstars.com/usa/twincities/startup-weekend/7442'
        },
        /**
         * @todo uncomment once confirmed
         */
        // {
        //     name:'Student Privacy Pledge Signatory',
        //     logo:'/assets/images/promo/logo--privacy-pledge.png',
        //     link:'https://studentprivacypledge.org/privacy-pledge/'
        // },
        {
            name:'California Student Data Privacy Signatory',
            logo:'/assets/images/promo/logo--sdpc.png',
            link:'https://sdpc.a4l.org/about_alliance.php?state=CA'
        },
        /**
         * Others we're considering:
         * - AVID? Corbin to ask
         * - SLP? Corbin to ask
         */
    ]
      
    constructor() {

    }

    ngOnInit() {

    }
  }