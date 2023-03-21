import { Client } from "pg";
import User from "./types/User";

class UserService {
  private database: Client;

  constructor(client: Client) {
    this.database = client;
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.database.query("SELECT * FROM rocketship.user");

    return result.rows;
  }

  // Queries are parameterized to avoid a possibility of SQL injection
  async getUserById(id: number): Promise<User | null> {
    const targetUser = await this.database.query(
      "SELECT * FROM rocketship.user WHERE id = $1",
      [id]
    );

    if (!targetUser.rowCount) {
      return null;
    }

    return targetUser.rows[0];
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const createdUser = await this.database.query(
      "INSERT INTO rocketship.user (name, email) VALUES ($1, $2) RETURNING id",
      [userData.name, userData.email]
    );

    const existingUser = await this.database.query(
      "SELECT * FROM rocketship.user WHERE email = $1",
      [userData.email]
    );

    if (!!existingUser.rowCount) {
      throw new Error("User with this email already exists");
    }

    return {
      ...userData,
      id: createdUser.rows[0].id,
    };
  }

  async updateUser(userData: User): Promise<User | null> {
    const targetUser = await this.database.query(
      "SELECT * FROM rocketship.user WHERE id = $1",
      [userData.id]
    );

    if (!targetUser.rowCount) {
      return null;
    }

    await this.database.query(
      "UPDATE rocketship.user SET name = $1, email = $2 WHERE id = $3",
      [userData.name, userData.email, userData.id]
    );

    return userData;
  }

  async deleteUser(id: number): Promise<void> {
    await this.database.query("DELETE FROM rocketship.user WHERE id = $1", [
      id,
    ]);
  }
}

export default UserService;
