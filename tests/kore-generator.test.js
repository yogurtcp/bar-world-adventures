import test from "node:test";
import { execFileSync } from "node:child_process";

test("Kore generation preserves pronunciation marks, shares cached clips and cannot activate incomplete audio", () => {
  execFileSync("python3", ["scripts/test-hebrew-kore.py"], {
    cwd: new URL("../", import.meta.url), stdio: "pipe",
  });
});
