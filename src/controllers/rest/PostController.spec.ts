import { PlatformTest } from "@tsed/common";
import { PostController } from "./PostController";

describe("PostController", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<PostController>(PostController);
    // const instance = PlatformTest.invoke<PostController>(PostController); // get fresh instance

    expect(instance).toBeInstanceOf(PostController);
  });
});
