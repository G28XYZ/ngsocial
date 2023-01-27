import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, from } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HttpHeaders } from '@angular/common/http';
import { HttpLink } from 'apollo-angular/http';
import cache from './cache';

const uri = 'http://localhost:8080/graphql';
export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
	const accessToken = localStorage.getItem('accessToken');
	const http = httpLink.create({ uri });
	const setAuthorizationLink = setContext(() => ({
		headers: new HttpHeaders().set('Authorization', `Bearer ${accessToken}`),
	}));
	return {
		link: from([setAuthorizationLink, http]),
		cache,
	};
}

@NgModule({
	exports: [ApolloModule],
	providers: [
		{
			provide: APOLLO_OPTIONS,
			useFactory: createApollo,
			deps: [HttpLink],
		},
	],
})
export class GraphQLModule {}
