import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AppAuthService } from '../../service/app.auth.service';

@Component({
    selector: 'app-no-access',
    templateUrl: './no-access.html',
    styleUrl: './no-access.css',
    imports: [MatIcon],
})
export class NoAccess {

    public authService = inject(AppAuthService)

}
