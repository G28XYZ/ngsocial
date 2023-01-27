import { TestBed } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { AuthResponse, RegisterResponse, REGISTER_MUTATION, User } from 'src/app/shared';
import { authState } from 'src/app/reactive';
import { AuthService } from './auth.service';
import { GET_AUTH_STATE } from 'src/app/reactive';
import { Apollo, QueryRef } from 'apollo-angular';
import { of } from 'rxjs';

describe('AuthService', () => {
	let service: AuthService;
	let controller: ApolloTestingController;
	// let apollo: Apollo;
	// apollo = TestBed.inject(Apollo);

	const fakeUser: User = {
		id: 'id#1',
		fullName: 'A B',
		username: 'a.b',
		email: 'a.b@email.com',
	} as User;

	const fakeToken: string =
		'NTNv7j0TuYARvmNMmWXo6fKvM4o6nv/aUi9ryX38ZH+L1bkrnD1ObOQ8JAUmHCBq7Iy7otZcyAagBLHVKvvYaIpmMuxmARQ97jUVG16Jkpkp1wXOPsrF9zwew6TpczyHkHgX5EuLg2MeBuiT/qJACs1J0apruOOJCg/gOtkjB4c=';

	const authResponse: AuthResponse = {
		token: fakeToken,
		user: fakeUser,
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ApolloTestingModule],
		});
		service = TestBed.inject(AuthService);
		controller = TestBed.inject(ApolloTestingController);
	});

	afterEach(() => {
		controller.verify();
	});

	it('should be created', () => true);
	it('should register a user', (done) => {
		const fakeRegisterResponse: RegisterResponse = {
			register: authResponse,
		};
		spyOn(service, 'updateAuthState' as never);
		service.register('A B', 'a.b', 'a.b@techiediaries.com', '1..9').subscribe({
			next: (result) => {
				expect(result).toEqual(fakeRegisterResponse);
				expect(service['updateAuthState']).toHaveBeenCalledOnceWith(
					fakeRegisterResponse.register.token,
					fakeRegisterResponse.register.user
				);
				done();
			},
		});
		const op = controller.expectOne((operation) => {
			expect(operation.query.definitions).toEqual(REGISTER_MUTATION.definitions);
			return true;
		});
		expect(op.operation.variables?.['fullName']).toEqual('A B');
		expect(op.operation.variables?.['username']).toEqual('a.b');
		expect(op.operation.variables?.['email']).toEqual('a.b@techiediaries.com');
		expect(op.operation.variables?.['password']).toEqual('1..9');

		op.flush({ data: fakeRegisterResponse });
	});
	it('should reset auth state when registration fails on server', (done) => {
		const initialState = {
			isLoggedIn: false,
			currentUser: null,
			accessToken: null,
		};
		const resetAuthStateSpy = spyOn(service, 'resetAuthState' as never);
		service.register('A B', 'a.b', 'a.b@techiediaries.com', '1..9').subscribe({
			error: (err) => {
				expect(authState()).toEqual(initialState);
				expect(resetAuthStateSpy).toHaveBeenCalled();
				done();
			},
		});
		const op = controller.expectOne((operation) => {
			expect(operation.query.definitions).toEqual(REGISTER_MUTATION.definitions);
			return true;
		});
		op.networkError({} as Error);
	});

	it('should authenticate a user');
	it('should reset auth state when login fails on server');
	it('should store user and token on updateAuthState call');
	it('should call localStorage.setItem on storeUser call');
	it('should call localStorage.setItem on storeToken call');

	// it('should return the isLoggedIn state', (done) => {
	// 	spyOn(apollo, 'watchQuery').and.returnValue({
	// 		valueChanges: of({
	// 			data: {
	// 				authState: {
	// 					isLoggedIn: true,
	// 				},
	// 			},
	// 		}),
	// 	} as QueryRef<any, any>);

	// 	service.isLoggedIn.subscribe((isLoggedIn: boolean) => {
	// 		expect(apollo.watchQuery).toHaveBeenCalledOnceWith({ query: GET_AUTH_STATE });
	// 		expect(isLoggedIn).toEqual(true);
	// 		done();
	// 	});
	// 	return true;
	// });

	it('should return the authenticated user state');
	it('should return the full auth state');
	it('should log out users');
	it('should search for users');
	it('should get user by ID');
});
