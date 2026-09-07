import { describe, expect, it } from "vitest";
import { cameraErrorMessage, parseLocationQr } from "../lib/qr-location";

describe("location QR validation", () => {
  it.each([
    "https://tkgo.bunkasai.info/?dep=58&qr=true",
    "https://tkgo.bunkasai.info/?qr=true&dep=58",
  ])("accepts the location URL %s", (url) => expect(parseLocationQr(url)).toBe("58"));
  it.each([
    "hello", "/?dep=58&qr=true", "javascript:alert(1)",
    "http://tkgo.bunkasai.info/?dep=58&qr=true",
    "https://tkgo.bunkasai.info.evil.test/?dep=58&qr=true",
    "https://tkgo.bunkasai.info@evil.test/?dep=58&qr=true",
    "https://user@tkgo.bunkasai.info/?dep=58&qr=true",
    "https://tkgo.bunkasai.info:444/?dep=58&qr=true",
    "https://tkgo.bunkasai.info/other?dep=58&qr=true",
    "https://tkgo.bunkasai.info/?dep=58",
    "https://tkgo.bunkasai.info/?dep=&qr=true",
    "https://tkgo.bunkasai.info/?dep=58&qr=false",
    "https://tkgo.bunkasai.info/?dep=58&qr=true&dep=1",
    "https://tkgo.bunkasai.info/?dep=58&qr=true&qr=false",
    "https://tkgo.bunkasai.info/?dep=58&qr=true&nav=true",
    "https://tkgo.bunkasai.info/?dep=58&qr=true#other",
  ])("rejects %s", (url) => expect(parseLocationQr(url)).toBeNull());
});

it.each(["NotAllowedError", "SecurityError", "NotFoundError", "OverconstrainedError", "NotReadableError", "AbortError", "UnknownError"])("provides recovery for %s", (name) => {
  expect(cameraErrorMessage(new DOMException("", name))).toMatch(/ください/);
});
