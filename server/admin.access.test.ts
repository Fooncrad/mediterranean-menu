import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: "admin" | "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: `${role}-sample`,
    email: `${role}@example.com`,
    name: role === "admin" ? "Owner" : "Guest",
    loginMethod: "test",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("admin access control", () => {
  it("allows an admin to access the admin identity procedure", async () => {
    const result = await appRouter.createCaller(createContext("admin")).admin.me();
    expect(result.role).toBe("admin");
  });

  it("rejects a regular user from the admin identity procedure", async () => {
    await expect(appRouter.createCaller(createContext("user")).admin.me()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
