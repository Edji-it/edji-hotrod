import { Routes, RouterModule } from '@angular/router'

// Project Dependencies
import { AuthService, DashboardGuardService } from './_services'
import { NewReadingPage } from './new-reading-page'
import { ProjectPageComponent } from './project-page'
import { HomeComponent } from './home'
import { RegisterPageComponent, CreateProfilePageComponent } from './register-page'
import { AccountComponent } from './account'
import { DashboardComponent, CreatedDashComponent, JoinedDashComponent } from './dashboard'
import { NoContentComponent } from './no-content'
import { LoginComponent } from './login'
import { RedeemToken } from './redeem-token/redeem-token.component'
import { HeroPromoPageComponent } from './hero-promo/hero-promo.component'
import { HeroPricingComponent } from './hero-pricing/hero-pricing.component'
import { DiscoverFeedComponent } from './discover-feed/discover-feed.component'
import { OAuthComponent } from './oauth-redirect/oauth-redirect.component'
import { LicenseRedirectComponent } from './license-redirect/license-redirect.component'
import { LicenseWelcomeComponent } from './license-welcome/license-welcome.component'
import { TeamPageComponent } from './team-page/team-page.component'
import { PromoPageComponent } from './promo/promo.component'
import { SearchPage } from './search-page/search-page.component'
import { ResetComponent } from './shared'

export const ROUTES: Routes = [
  {
    path: 'reset-route',
    component: ResetComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
    // Ideally we would use the AuthService canActivate initially, but it does not work with "redirectTo"
    // canActivate: [AuthService]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [DashboardGuardService],
    children: [
      // Root path must be explicitly handled by canActivate, since the parent canActivate is not re-evaluated
      { path: '', pathMatch: 'full', component: DashboardComponent, canActivate: [DashboardGuardService] },
      { path: 'create', component: CreatedDashComponent },
      { path: 'create/search', component: CreatedDashComponent },
      { path: 'read', component: JoinedDashComponent },
    ],
  },
  { path: 'create', redirectTo: '/dashboard/create' },
  { path: 'read', redirectTo: '/dashboard/read' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'register/profile', component: CreateProfilePageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'account', component: AccountComponent, canActivate: [AuthService] },
  { path: 'discover/legacy', component: DiscoverFeedComponent, canActivate: [AuthService] },
  { path: 'discover', component: SearchPage },
  { path: 'discover/search', component: SearchPage },
  { path: 'project/:id', component: ProjectPageComponent },
  { path: 'embed/:id', component: ProjectPageComponent },
  { path: 'license/accept/:license_id', component: LicenseRedirectComponent, pathMatch: 'full' },
  {
    path: 'license/welcome/:institution_id',
    component: LicenseWelcomeComponent,
    canActivate: [AuthService],
    pathMatch: 'full',
  },
  { path: 'new-reading', component: NewReadingPage, canActivate: [AuthService] },
  { path: 'new-reading/:id', component: NewReadingPage, canActivate: [AuthService] },
  { path: 'redeem-token/:type/:token', component: RedeemToken },
  { path: 'features', component: HeroPromoPageComponent, pathMatch: 'full' },
  { path: 'hero', redirectTo: '/plans', pathMatch: 'full' },
  { path: 'pricing', redirectTo: '/plans', pathMatch: 'full' },
  { path: 'plans', component: HeroPricingComponent, pathMatch: 'full' },
  { path: 'promo', component: PromoPageComponent, pathMatch: 'full' },
  { path: 'about', component: TeamPageComponent },
  { path: 'academy', loadChildren: './academy/academy.module#AcademyModule' },
  { path: 'oauth/:type', component: OAuthComponent, pathMatch: 'full' },
  { path: 'not-found', component: NoContentComponent, pathMatch: 'full' },
  { path: ':projectId', redirectTo: '/project/:projectId', pathMatch: 'full' },
  { path: '**', component: NoContentComponent },
]
