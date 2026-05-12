import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AgentService } from '../services/agent.service';
import { UserRole } from '../models/enums';

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const agentService = inject(AgentService);
    const router = inject(Router);
    return agentService.getCurrentAgent().pipe(
      map(agent => {
        if (agent && allowedRoles.includes(agent.role)) return true;
        router.navigate(['/dashboard']);
        return false;
      })
    );
  };
}
