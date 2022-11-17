import { PlatformTest } from "@tsed/common";
import SuperTest from "supertest";
import { PostController } from "./PostController";
import { Server } from "../../Server";

describe("PostController", () => {
  let request: SuperTest.SuperTest<SuperTest.Test>;

  beforeEach(PlatformTest.bootstrap(Server, {
    mount: {
      "/": [PostController]
    }
  }));
  beforeEach(() => {
    request = SuperTest(PlatformTest.callback());
  });

  afterEach(PlatformTest.reset);

  it("should call GET /posts", async () => {
     const response = await request.get("/posts").expect(200);

     expect(response.text).toEqual("hello");
  });
});
