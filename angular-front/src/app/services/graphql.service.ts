import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Sector } from '../models/sector.model';
import { User } from '../models/user.model';

const GQL_URL = import.meta.env.NG_APP_GRAPHQL_URL;

const USER_FIELDS = 'id name selectedSectorIds agreeToTerms';

const SECTOR_FIELDS = 'id name parentId';

type GqlError = { message: string };

type GqlResponse<T> = {
  data?: T | null;
  errors?: GqlError[];
};

function readDataOrThrow<T>(response: GqlResponse<T>): T {
  if (response.errors?.length) {
    throw new Error(response.errors.map((e) => e.message).join('; '));
  }
  if (response.data == null) {
    throw new Error('GraphQL response contained no data');
  }
  return response.data;
}

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private http = inject(HttpClient);

  getSectors(): Observable<Sector[]> {
    return this.http
      .post<GqlResponse<{ sectors: Sector[] }>>(GQL_URL, {
        query: `{ sectors { ${SECTOR_FIELDS} } }`,
      })
      .pipe(map((r) => readDataOrThrow(r).sectors));
  }

  getSessionUser(id: string): Observable<User | null> {
    return this.http
      .post<GqlResponse<{ sessionUser: User | null }>>(GQL_URL, {
        query: `query GetSessionUser($id: ID!) {
          sessionUser(id: $id) { ${USER_FIELDS} }
        }`,
        variables: { id },
      })
      .pipe(map((r) => readDataOrThrow(r).sessionUser));
  }

  saveUserData(
    name: string,
    selectedSectorIds: string[],
    agreeToTerms: boolean,
    id?: string,
  ): Observable<User> {
    return this.http
      .post<GqlResponse<{ saveUserData: User }>>(GQL_URL, {
        query: `mutation SaveUserData($id: ID, $name: String!, $selectedSectorIds: [String!]!, $agreeToTerms: Boolean!) {
          saveUserData(id: $id, name: $name, selectedSectorIds: $selectedSectorIds, agreeToTerms: $agreeToTerms) {
            ${USER_FIELDS}
          }
        }`,
        variables: { id: id ?? null, name, selectedSectorIds, agreeToTerms },
      })
      .pipe(map((r) => readDataOrThrow(r).saveUserData));
  }
}
