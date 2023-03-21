// This is a minimalistic web server example in which UserService is provided with database Client,
// so that it is possible to test the actual service by providing a mocked instance or a stub.
// No ORM has been used intentionally to simplify the example.

import express, { Request, Response } from "express";
import UserService from "./UserService";
import User from "./types/User";
import { Client } from "pg";

import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const client = new Client({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: "localhost",
  database: "rocketship",
});
client.connect();

const app = express();
const userService = new UserService(client);

app.use(express.json());

// GET all users
app.get("/users", async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();

  res.send(users);
});

// GET user by ID
app.get("/users/:id", async (req: Request, res: Response) => {
  const user = await userService.getUserById(parseInt(req.params.id));

  if (user) {
    res.send(user);
  } else {
    res.status(404).send("User not found");
  }
});

// POST new user
app.post("/users", async (req: Request, res: Response) => {
  const userData = req.body as Omit<User, "id">;

  try {
    const result = await userService.createUser(userData);
    res.status(201).send(result);
  } catch (error: any) {
    res.status(409).send(error.message);
  }
});

// PUT update user by ID
app.put("/users", async (req: Request, res: Response) => {
  const updatedUser = await userService.updateUser(req.body as User);

  if (updatedUser != null) {
    res.status(200).json(updatedUser);
  } else {
    res.status(404).send("User not found");
  }
});

// DELETE user by ID
app.delete("/users/:id", async (req: Request, res: Response) => {
  await userService.deleteUser(parseInt(req.params.id));

  res.status(204).send();
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
