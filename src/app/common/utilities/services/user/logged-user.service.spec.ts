import { TestBed } from '@angular/core/testing';
import { LoggedUserService } from './logged-user.service';
import { take } from 'rxjs/operators';

describe('LoggedUserService', () => {
  let service: LoggedUserService;


  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggedUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit null as initial value', (done) => {
const mockUser = {
  accessToken: 'mock-token',
  name: 'Test User',
  username: 'test@example.com'
};
    service.update(mockUser);

    service.accessToken$.pipe(take(1)).subscribe((value) => {
      expect(value).toEqual(mockUser);
      done();
    });
  });
});
