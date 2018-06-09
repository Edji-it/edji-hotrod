/**
 * Shared Module
 * - Used to import/export components shared globally
 * - Only add components when they are *needed* globally
 */
import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, PreloadAllModules } from "@angular/router"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"

// Project Dependencies
import { NavBarComponent, FooterComponent, FollowTag, FeedbackComponent } from "./shared"
import { ROUTES } from "./app.routes";
// Pipes
import { 
    AddClassPipe, 
    EdjiDatePipe, 
    EmojiOnePipe, 
    LinkifyPipe, 
    SubjectPipe, 
    UserInitialsPipe 
  } from './_pipes'
import { ShareCodeComponent } from "./modals/share-code/share-code.component"
import { ReferralModalComponent, HeroSubscribeComponent } from "./modals"

let SHARED_DECLARATIONS = [
    AddClassPipe,
    EdjiDatePipe,
    EmojiOnePipe,
    FeedbackComponent,
    FollowTag,
    FooterComponent, 
    HeroSubscribeComponent,
    LinkifyPipe, 
    NavBarComponent,
    ReferralModalComponent,
    SubjectPipe, 
    ShareCodeComponent,
    UserInitialsPipe,
]

let SHARED_IMPORTS = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
]

@NgModule({
    imports: [
        SHARED_IMPORTS,
        // Routes have to be privately imported for every module
        // RouterModule.forChild(ROUTES)  
        RouterModule
     ],
     /**
      * Declarations are private to AppShared
      * - SharedModule shouldn't need any private components
      */
    declarations: [
        SHARED_DECLARATIONS
    ],
    /**
     * Exports are made available to children modules
     * (essentially PUBLIC DECLARATIONS)
     */
    exports: [
        SHARED_DECLARATIONS,
        SHARED_IMPORTS
    ]
})
export class SharedModule {}