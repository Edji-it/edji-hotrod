import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class ReuseStrategy implements RouteReuseStrategy {
  private handlers: {[key: string]: DetachedRouteHandle} = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // keep the route if it's going to dashboard
    // can be expanded into array if we want to keep other components
    if (route.routeConfig.path === "dashboard") {
      return true;
    } else {
      return false;
    }
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
      // console.debug('CustomReuseStrategy:store', route, handle);
      this.handlers[route.routeConfig.path] = handle;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
      // console.debug('CustomReuseStrategy:shouldAttach', route);
      return !!route.routeConfig && !!this.handlers[route.routeConfig.path];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
      // console.debug('CustomReuseStrategy:retrieve', route);
      if (!route.routeConfig) return null;
      return this.handlers[route.routeConfig.path];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
      if (future.routeConfig === "dashboard") {
        return true;
      } else {
        return false;
      }
      
  }
}