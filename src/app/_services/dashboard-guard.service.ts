import { Injectable } from '@angular/core'
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router'
import { AuthService } from '.'

@Injectable()
export class DashboardGuardService implements CanActivate {
  constructor(private router: Router, private _auth: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let user = this._auth.getUser()

    if (!user.isLoggedIn) {
      // Redirect users not logged in
      // - Handle referral links to the register page
      if (route.queryParams['r']) {
        this.router.navigate(['/register'], { queryParams: { referral_id: route.queryParams['r'] } })
      } else {
        this.router.navigate(['/home'])
      }
      return false
    } else if (user.profileIncomplete) {
      // Guide user to completing their profile before continuing
      this.router.navigate(['/register/profile'])
    } else {
      // Handle default dashboard for students/teachers
      let useDefault: boolean = state.url == '/dashboard' || state.url == '/'
      if (!useDefault) {
        return true
      } else if (user.isStudent) {
        this.router.navigate(['/dashboard/read'])
        return false
      } else {
        this.router.navigate(['/dashboard/create'])
        return false
      }
    }
  }
}
