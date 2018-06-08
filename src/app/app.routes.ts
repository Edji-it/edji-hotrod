import { Routes, RouterModule } from '@angular/router'

// Project Dependencies
import { AuthService } from './_services'
import { NewReadingPage } from './new-reading-page';
import { ProjectPageComponent } from './project-page';
import { HomeComponent } from './home';
import { RegisterPageComponent } from './register-page';
import { AccountComponent } from './account';
import { DashboardComponent } from './dashboard';
import { NoContentComponent } from './no-content';
import { LoginComponent } from './login';
import { ResetPassPage } from './reset-pass/reset-pass-page.component';
import { HeroPromoComponent } from './hero-promo/hero-promo.component';
import { HeroPricingComponent } from './hero-pricing/hero-pricing.component';
import { DiscoverFeedComponent } from "./discover-feed/discover-feed.component";
import { OAuthComponent } from './oauth-redirect/oauth-redirect.component';
import { LicenseRedirectComponent } from './license-redirect/license-redirect.component';


export const ROUTES: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthService] },
  { path: 'dashboard',  component: DashboardComponent, canActivate: [AuthService] },
  { path: 'home',  component: HomeComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'account', component: AccountComponent, canActivate: [AuthService] },
  { path: 'discover', component: DiscoverFeedComponent, canActivate: [AuthService] },
  { path: 'project/:id',  component: ProjectPageComponent },
  { path: 'license/accept/:license_id', component: LicenseRedirectComponent, pathMatch: 'full' },
  { path: 'new-reading', component: NewReadingPage, canActivate: [AuthService] },
  { path: 'new-reading/:id', component: NewReadingPage, canActivate: [AuthService] },
  { path: 'reset-password', component: ResetPassPage },
  { path: 'hero', component: HeroPromoComponent, pathMatch: 'full' },
  { path: 'pricing', component: HeroPricingComponent, pathMatch: 'full'  },
  { path: 'academy', loadChildren: './academy/academy.module#AcademyModule' },
  { path: 'oauth/:type', component: OAuthComponent, pathMatch: 'full' },
  { path: 'not-found',    component: NoContentComponent, pathMatch: 'full' },
  { path: ':projectId', redirectTo: '/project/:projectId', pathMatch: 'full'},
  { path: '**',    component: NoContentComponent }
]