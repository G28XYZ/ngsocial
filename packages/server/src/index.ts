import express, { Application } from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import schema from './graphql/schema';
import cors from 'cors';
import 'reflect-metadata';
import { Repository } from 'typeorm';
import { User, Post, Comment, Like, Notification } from './entity';
import { AppDataSource } from './data-source';
import jwt from 'jsonwebtoken';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer, ConnectionParams } from 'subscriptions-transport-ws';

dotenv.config();

const { JWT_SECRET } = process.env;

const getAuthUser = (token: string) => {
	try {
		if (token) {
			return jwt.verify(token, JWT_SECRET as string);
		}
		return null;
	} catch (error) {
		return null;
	}
};

export type Context = {
	orm: {
		userRepository: Repository<User>;
		postRepository: Repository<Post>;
		commentRepository: Repository<Comment>;
		likeRepository: Repository<Like>;
		notificationRepository: Repository<Notification>;
	};
	authUser: User | null;
};

AppDataSource.initialize()
	.then(() => {
		startApolloServer();
	})
	.catch((error) => console.log('Database connection error: ', error));

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const postRepository: Repository<Post> = AppDataSource.getRepository(Post);
const commentRepository: Repository<Comment> = AppDataSource.getRepository(Comment);
const likeRepository: Repository<Like> = AppDataSource.getRepository(Like);
const notificationRepository: Repository<Notification> = AppDataSource.getRepository(Notification);

async function startApolloServer() {
	const PORT = 8080;
	const app: Application = express();
	app.use(cors());
	app.use(graphqlUploadExpress());
	const httpServer = createServer(app);

	const server: ApolloServer = new ApolloServer({
		schema,
		context: ({ req }) => {
			const token = req.get('Authorization') || '';
			const authUser = getAuthUser(token.split(' ')[1]);
			const ctx: Context = {
				orm: {
					userRepository: userRepository,
					postRepository: postRepository,
					commentRepository: commentRepository,
					likeRepository: likeRepository,
					notificationRepository: notificationRepository,
				},
				authUser: authUser as any,
			};
			return ctx;
		},
		plugins: [
			{
				async serverWillStart() {
					return {
						async drainServer() {
							subscriptionServer.close();
						},
					};
				},
			},
		],
	});
	const subscriptionServer = SubscriptionServer.create(
		{
			schema,
			execute,
			subscribe,
			onConnect: (connectionParams: ConnectionParams) => {
				const token = connectionParams.get('authToken') || '';
				if (token != '') {
					const authUser = getAuthUser(token.split('')[1]);
					return {
						authUser: authUser,
					};
				}
				throw new AuthenticationError('User is not authenticated');
			},
		},
		{ server: httpServer, path: server.graphqlPath }
	);

	await server.start();
	server.applyMiddleware({
		app,
		path: '/graphql',
	});
	// app.listen(PORT, () => {
	// 	console.log(`Server is running at http://localhost:${PORT}`);
	// });
	httpServer.listen(PORT, () => {
		console.log(`Server is running at http://localhost:${PORT}`);
	});
}
