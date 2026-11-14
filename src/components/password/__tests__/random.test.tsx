/*
  THIS IS ONLY FOR RANDOM TESTS / IGNORE
*/

import { describe, expect, it, vi } from "vitest";

describe("random", () => {
  it("function should be called at least two times", () => {
    const fn = vi.fn();

    fn();
    fn();

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
