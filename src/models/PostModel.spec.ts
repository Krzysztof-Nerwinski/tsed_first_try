import { PlatformTest } from "@tsed/common";
import { PostModel } from "./PostModel";

describe("PostModel", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should do something", () => {
    const instance = PlatformTest.get<PostModel>(PostModel);
    // const instance = PlatformTest.invoke<PostModel>(PostModel); // get fresh instance

    expect(instance).toBeInstanceOf(PostModel);
  });
});
