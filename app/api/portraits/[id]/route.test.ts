import { beforeEach, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  session: vi.fn(),
  access: vi.fn(),
  photo: vi.fn(),
}));
vi.mock("@/lib/server/runtime", () => ({
  getSession: mock.session,
  engine: { photoAccess: mock.access },
}));
vi.mock("@/lib/server/photos", () => ({ readPhoto: mock.photo }));

import { GET } from "./route";

const call = () =>
  GET(new Request("http://localhost/api/portraits/member"), {
    params: Promise.resolve({ id: "member" }),
  });
beforeEach(() => {
  vi.resetAllMocks();
  mock.session.mockResolvedValue({ role: "member", accountId: "viewer" });
  mock.access.mockReturnValue(true);
  mock.photo.mockResolvedValue({
    bytes: Buffer.from("test"),
    type: "image/png",
  });
});
it("returns indistinguishable no-store 404 for anonymous/forbidden requests without reading image", async () => {
  mock.session.mockResolvedValue(null);
  const result = await call();
  expect(result.status).toBe(404);
  expect(result.headers.get("Cache-Control")).toContain("no-store");
  expect(mock.photo).not.toHaveBeenCalled();
  mock.session.mockResolvedValue({ role: "member", accountId: "viewer" });
  mock.access.mockReturnValue(false);
  expect((await call()).status).toBe(404);
  expect(mock.photo).not.toHaveBeenCalled();
});
it("refuses image after concurrent logout or session expiry", async () => {
  mock.session
    .mockResolvedValueOnce({ role: "member", accountId: "viewer" })
    .mockResolvedValueOnce(null);
  expect((await call()).status).toBe(404);
});
it("refuses image if match ended while file was read", async () => {
  mock.access.mockReturnValueOnce(true).mockReturnValueOnce(false);
  expect((await call()).status).toBe(404);
});
it("serves authorized image without shared caching", async () => {
  const result = await call();
  expect(result.status).toBe(200);
  expect(result.headers.get("Vary")).toBe("Cookie");
  expect(result.headers.get("Content-Type")).toBe("image/png");
  expect(result.headers.get("Cache-Control")).toContain("private");
  expect(result.headers.get("Cross-Origin-Resource-Policy")).toBe(
    "same-origin",
  );
});
