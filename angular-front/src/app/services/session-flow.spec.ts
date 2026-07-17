import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GraphqlService } from './graphql.service';
import { SessionService } from './session.service';
import { User } from '../models/user.model';

describe('save → session → reload', () => {
  let graphql: GraphqlService;
  let session: SessionService;
  let httpMock: HttpTestingController;

  const savedUser: User = {
    id: 'user-1',
    name: 'Ada',
    selectedSectorIds: ['342'],
    agreeToTerms: true,
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        GraphqlService,
        SessionService,
      ],
    });

    graphql = TestBed.inject(GraphqlService);
    session = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('saves user data, stores the id, and restores the user after reload', async () => {
    const savePromise = firstValueFrom(
      graphql.saveUserData('Ada', ['342'], true),
    );

    const saveReq = httpMock.expectOne(
      (req) =>
        req.method === 'POST' &&
        typeof req.body?.query === 'string' &&
        req.body.query.includes('saveUserData'),
    );
    expect(saveReq.request.body.variables).toEqual({
      id: null,
      name: 'Ada',
      selectedSectorIds: ['342'],
      agreeToTerms: true,
    });
    saveReq.flush({ data: { saveUserData: savedUser } });

    const user = await savePromise;
    session.setUser(user);

    expect(localStorage.getItem('userId')).toBe('user-1');
    expect(session.user()).toEqual(savedUser);
    expect(session.userName()).toBe('Ada');

    // Simulate a fresh app load: new SessionService, same localStorage.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        GraphqlService,
        SessionService,
      ],
    });

    const sessionAfterReload = TestBed.inject(SessionService);
    const httpMockAfterReload = TestBed.inject(HttpTestingController);

    expect(sessionAfterReload.user()).toBeNull();

    sessionAfterReload.loadFromStorage();

    const sessionReq = httpMockAfterReload.expectOne(
      (req) =>
        req.method === 'POST' &&
        typeof req.body?.query === 'string' &&
        req.body.query.includes('sessionUser'),
    );
    expect(sessionReq.request.body.variables).toEqual({ id: 'user-1' });
    sessionReq.flush({ data: { sessionUser: savedUser } });

    expect(sessionAfterReload.user()).toEqual(savedUser);
    expect(sessionAfterReload.userName()).toBe('Ada');

    httpMockAfterReload.verify();
  });
});
