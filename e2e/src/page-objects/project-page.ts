import { browser, by, element, protractor } from 'protractor';
import { PageObjectInterface } from './PageObjectInterface';

export class Project implements PageObjectInterface {

  /*
  Last Mod: 8 Aug 2017
  
  Easily reference parts of the project page test page.
  */
  private EC = protractor.ExpectedConditions;

  // Element References
  public addEmojiBtn = element(by.id("addEmojiComment"));
  public addTextBtn = element(by.id("addTextComment"));
  public addAudioBtn = element(by.id("addAudioComment"));
  public addEmojiBtnMobile = element(by.id("addEmojiCommentMobile"));
  public addTextBtnMobile = element(by.id("addTextCommentMobile"));
  public addAudioBtnMobile = element(by.id("addAudioCommentMobile"));
  public addTextReplyBtn = element(by.id("addTextReply"));
  public addEmojiReplyBtn = element(by.id("addEmojiReply"));
  public addAudioReplyBtn = element(by.id("addAudioReply"));
  public image = element(by.css('article .img-wrap > img'));
  public textComment = element(by.css('.new .text-comment textarea'));
  public existingTextComment = element(by.css('div.text-comment-input'));
  public textReplyComment = element(by.css('.replyComment.new .text-comment-input'));
  public dismissReplyPanelBtn = element(by.id('discussionClosePanel'));
  public discussionPanel = element(by.css('div.sliding-pane.from-left.replies.slide-in'));
  public commentSave = element(by.css('.comment__save'));
  public replyDelete = element(by.css('button.inline-delete'));
  public discussionsPane = element(by.css('.replies.slide-in'));
  public imageRight = 25;
  public imageDown = 25;
  public tutorialSkip = element(by.css('.tooltip__skip'));
  public commentOptionsShow = element(by.css('.text-options.active'));
  public commentNotHidden = element(by.css('edji-comment:not(.hidden)'));

  // Audio Comment test variables
  public audioPlay = element(by.css('edji-comment:not(.hidden) audio-comment #audioPlay'));
  public audioPause = element(by.css('edji-comment:not(.hidden) audio-comment #audioPause'));
  public audioRestart = element(by.css('edji-comment:not(.hidden) audio-comment #audioRestart'));
  public audioRecord = element(by.css('edji-comment:not(.hidden) audio-comment #audioRecord'));
  public emojiCommentSave = element(by.css('edji-comment .comment-action--save'));
  public audioComment = element.all(by.css('.audio-comment-input-wrapper')).first();

  // Avatar comment pane activators
  public avatarText = element(by.css('.user-icon.avatar-text'));
  public avatarEmoji = element(by.css('.user-icon.avatar-emoji'));
  public avatarAudio = element(by.css('.user-icon.avatar-audio'));
  public avatarTextReply = element(by.css('.user-icon.avatar-text .comment__button--mobile.avatar__reply'));
  public mobileTextReply = element(by.css('edji-comment:not(.hidden) .hidden-lg-up.comment__button--mobile'));
  public commentDelete = element.all(by.css('edji-comment button.btn-delete')).last();
  public addReplyBtn = element(by.id("addReply"));
  public emojiCommentDelete = element(by.css('edji-comment button.btn-delete'));
  public closePane = element(by.css('.sliding-pane-comment__header button.close'));

  public getPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    // browser.get("/#");
    // browser.refresh();
    // Load a good sample Project with Emoji and Text commenting (owned by teach/teach)
    browser.get("/#/project/test");
  }

  public getAudioPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    // browser.get("/#");
    // browser.refresh();
    // Load a good sample Project with Audio commenting (owned by testhero/testhero16)
    browser.get("/#/project/audio");
  }

  public getReplyPage(): void {
    // First we clear out the url (sometimes page is preserved if the url stays the same)
    // browser.get("/#");
    // browser.refresh();
    // Load a good sample Project with reply functions (owned by testhero/testhero16)
    browser.get("/#/project/reply");
  }

  public skipTutorial(): void {
    // Click the share button for new reading no matter if it is on desktop or mobile
    this.tutorialSkip.isPresent().then((result) => {
      if (result) {
        this.tutorialSkip.isDisplayed().then((result) => {
          if (result) {
            browser.wait(this.EC.elementToBeClickable(this.tutorialSkip), 5000, "failed to find the tutorial skip button");
            this.tutorialSkip.click()
          }
        });
      }
    });
  }

  public addEmojiComment(): void {
    browser.wait(this.EC.presenceOf(this.commentOptionsShow), 5000, "never found comment options");
    this.addEmojiBtn.isPresent().then((result) => {
      if (result) {
        this.addEmojiBtn.isDisplayed().then((result) => {
          if (result) {
            // Desktop clicking of the add emoji comment button
            browser.wait(this.EC.elementToBeClickable(this.addEmojiBtn), 5000, "never found the add emoji comment button");
            this.addEmojiBtn.click();
          } else {
            // Mobile clicking of the add emoji comment button
            browser.wait(this.EC.elementToBeClickable(this.addEmojiBtnMobile), 5000, "never found the add emoji comment button");
            this.addEmojiBtnMobile.click();
          }
        });
      } 
    });
  }

  public addTextComment(): void {
    browser.wait(this.EC.presenceOf(this.commentOptionsShow), 5000, "never found comment options");
    this.addTextBtn.isPresent().then((result) => {
      if (result) {
        this.addTextBtn.isDisplayed().then((result) => {
          if (result) {
            // Desktop clicking of the add emoji comment button
            browser.wait(this.EC.elementToBeClickable(this.addTextBtn), 5000, "never found the add emoji comment button");
            this.addTextBtn.click();
          } else {
            // Mobile clicking of the add emoji comment button
            browser.wait(this.EC.elementToBeClickable(this.addTextBtnMobile), 5000, "never found the add emoji comment button");
            this.addTextBtnMobile.click();
          }
        });
      } 
    });
  }

  public addAudioComment(): void {
    browser.wait(this.EC.presenceOf(this.commentOptionsShow), 5000, "never found comment options");
    this.addAudioBtn.isPresent().then((result) => {
      if (result) {
        this.addAudioBtn.isDisplayed().then((result) => {
          if (result) {
            // Desktop clicking of the add emoji comment button
            browser.wait(this.EC.elementToBeClickable(this.addAudioBtn), 5000, "never found the add audio comment button");
            this.addAudioBtn.click();
          } else {
            // Mobile clicking of the add audio comment button
            browser.wait(this.EC.elementToBeClickable(this.addAudioBtnMobile), 5000, "never found the add audio comment button");
            this.addAudioBtnMobile.click();
          }
        });
      } 
    });
  }

  public openReplyPane(): void {
    browser.wait(this.EC.presenceOf(this.commentNotHidden), 5000, "never found comment");
    this.avatarTextReply.isPresent().then((result) => {
      if (result) {
        this.avatarTextReply.isDisplayed().then((result) => {
          if (result) {
            // Desktop clicking of the open reply pane
            browser.wait(this.EC.elementToBeClickable(this.avatarTextReply), 5000, "never found the existing comment to reply to");
            this.avatarTextReply.click()
          } else {
            // Mobile clicking of the open reply pane
            browser.wait(this.EC.elementToBeClickable(this.mobileTextReply), 5000, "never found the existing comment to reply to");
            this.mobileTextReply.click()
          }
        });
      } 
    });
  }
} // class