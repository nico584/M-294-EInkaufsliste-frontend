import { Component, inject } from '@angular/core';
import { AppAuthService } from '../../service/app.auth.service';

@Component({
    selector: 'app-no-access',
    templateUrl: './no-access.html',
    styleUrl: './no-access.css',
    imports: [],
})
export class NoAccess {

    public authService = inject(AppAuthService)

}
