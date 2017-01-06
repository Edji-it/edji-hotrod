import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class ReuseStrategy implements RouteReuseStrategy {
  private handlers: {[key: string]: DetachedRouteHandle} = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (route.routeConfig.path === "dashboard") {
      console.log("saving route!");
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
      // console.debug('CustomReuseStrategy:shouldReuseRoute', future, curr);
      return future.routeConfig === curr.routeConfig;
  }
}