import getIdFromName from "./getIdFromName";

const testObject = {
  fj3i28fa: "notTarget",
  dfk39safk: "alsoNotTarget",
  gj838gai: "target",
  f88f38uf89: "finalName",
};

test("gets correct id", () => {
  expect(getIdFromName("target", testObject)).toBe("gj838gai");
});
