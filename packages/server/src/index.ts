import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import schema from "./graphql/schema";
import cors from "cors";
import "reflect-metadata";
import { Repository } from "typeorm";
import { User, Post, Comment, Like, Notification } from "./entity";
import { AppDataSource } from "./data-source";

export type Context = {
  orm: {
    userRepository: Repository<User>;
    postRepository: Repository<Post>;
    commentRepository: Repository<Comment>;
    likeRepository: Repository<Like>;
    notificationRepository: Repository<Notification>;
  };
};

AppDataSource.initialize()
  .then(() => {
    startApolloServer();
  })
  .catch((error) => console.log("Database connection error: ", error));

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const postRepository: Repository<Post> = AppDataSource.getRepository(Post);
const commentRepository: Repository<Comment> = AppDataSource.getRepository(Comment);
const likeRepository: Repository<Like> = AppDataSource.getRepository(Like);
const notificationRepository: Repository<Notification> = AppDataSource.getRepository(Notification);

async function startApolloServer() {
  const PORT = 8080;
  const app: Application = express();
  app.use(cors());

  const context: Context = {
    orm: {
      userRepository: userRepository,
      postRepository: postRepository,
      commentRepository: commentRepository,
      likeRepository: likeRepository,
      notificationRepository: notificationRepository,
    },
  };
  const server: ApolloServer = new ApolloServer({ schema, context });

  await server.start();
  server.applyMiddleware({
    app,
    path: "/graphql",
  });
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}
