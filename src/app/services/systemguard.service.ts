import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthguardService } from './authguard.service';

  
@Injectable({
  providedIn: 'root'
})

export class SystemguardService implements CanActivate{

  constructor(private router: Router, private authGuard : AuthguardService) { }
  
  private admin_id;
  public authorized_admin = false;
  private admin_name;
  
  
  // System Administrator Service //////////////   


  canActivate(route: ActivatedRouteSnapshot,state : RouterStateSnapshot):boolean {
    
    if(this.checkLoginUser()) {
          if(this.authGuard.user_type == 'system_admin') {
              return true;
          } else {
              this.router.navigate(['/404']);
              return false;
          }
    } else {
        this.router.navigate(['/serviceadmin/index']);
        return false;
    }
  }
  
  checkLoginUser() {
    if (this.authGuard.isAuthenticated) {
      return true;
      
    } else {
      return false;
    }
  }

}

