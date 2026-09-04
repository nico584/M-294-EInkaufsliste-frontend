import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UserProfile } from './user-profile';
import { User } from '../../data/user';
import { UserService } from '../../service/user.service';

describe('UserProfile', () => {
  let component: UserProfile;
  let fixture: ComponentFixture<UserProfile>;

  const user: User = { id: 1, username: 'nseiler', firstName: 'Nico', lastName: 'Seiler' };

  beforeEach(async () => {
    const serviceStub = { getMe: vi.fn().mockReturnValue(of(user)) };

    await TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [{ provide: UserService, useValue: serviceStub }],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load the current user', () => {
    expect(component).toBeTruthy();
    expect(component.user).toEqual(user);
  });
});
