import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

import { User } from '../../data/user';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
  imports: [MatCardModule, MatIcon],
})
export class UserProfile implements OnInit {
  public user: User | null = null;

  private service = inject(UserService);

  ngOnInit(): void {
    this.service.getMe().subscribe(user => {
      this.user = user;
    });
  }
}
