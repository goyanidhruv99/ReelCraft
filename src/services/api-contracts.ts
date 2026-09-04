/**
 * Future NestJS-facing service contracts.
 * Keep React components free of backend business logic.
 */

export interface VideoServiceContract {
  list(): Promise<unknown[]>;
  get(id: string): Promise<unknown | null>;
  create(input: unknown): Promise<unknown>;
  update(id: string, input: unknown): Promise<unknown>;
  remove(id: string): Promise<void>;
}

export const API_BASE_PATH = "/api/v1";
