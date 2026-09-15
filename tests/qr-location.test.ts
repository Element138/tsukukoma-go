import { describe, expect, it } from "vitest";
import { cameraErrorMessage, isTsukukomaGoUrl, parseLocationQr } from "../lib/qr-location";

describe("location QR validation", () => {
  it.each([
    "https://tkgo.bunkasai.info/?dep=58",
    "https://tkgo.bunkasai.info/?dep=58&qr=true",
    "https://tkgo.bunkasai.info/?dep=58&qr=false",
    "https://tkgo.bunkasai.info/?dep=58&qr=poster",
    "https://tkgo.bunkasai.info/?dep=58&qr=true&qr=false",
    "https://tkgo.bunkasai.info/?qr=true&dep=58",
  ])("accepts the location URL %s", (url) => expect(parseLocationQr(url)).toEqual({ departureId: "58", destinationId: null }));
  it.each([
    "https://tkgo.bunkasai.info/?dep=58&dest=2",
    "https://tkgo.bunkasai.info/?dest=2&dep=58&qr=false",
  ])("accepts destination information in %s", (url) => expect(parseLocationQr(url)).toEqual({ departureId: "58", destinationId: "2" }));
  it.each([
    "hello", "/?dep=58&qr=true", "javascript:alert(1)",
    "http://tkgo.bunkasai.info/?dep=58&qr=true",
    "https://tkgo.bunkasai.info.evil.test/?dep=58&qr=true",
    "https://tkgo.bunkasai.info@evil.test/?dep=58&qr=true",
    "https://user@tkgo.bunkasai.info/?dep=58&qr=true",
    "https://tkgo.bunkasai.info:444/?dep=58&qr=true",
    "https://tkgo.bunkasai.info/other?dep=58&qr=true",
    "https://tkgo.bunkasai.info/?dep=&qr=true",
    "https://tkgo.bunkasai.info/?dep=58&qr=true&dep=1",
    "https://tkgo.bunkasai.info/?dep=58&dest=",
    "https://tkgo.bunkasai.info/?dep=58&dest=2&dest=3",
    "https://tkgo.bunkasai.info/?dep=58&qr=true&nav=true",
    "https://tkgo.bunkasai.info/?dep=58&qr=true#other",
  ])("rejects %s", (url) => expect(parseLocationQr(url)).toBeNull());
});

describe("Tsukukoma GO URL identification", () => {
  it.each([
    "https://tkgo.bunkasai.info/?dep=missing&qr=true",
    "http://tkgo.bunkasai.info/?dep=58&qr=true",
    "https://tkgo.bunkasai.info/not-a-location",
  ])("identifies an invalid Tsukukoma GO URL %s", (url) => expect(isTsukukomaGoUrl(url)).toBe(true));
  it.each([
    "https://tkgo.bunkasai.info.evil.test/?dep=58&qr=true",
    "https://tkgo.bunkasai.info@evil.test/?dep=58&qr=true",
    "hello",
  ])("does not identify an unrelated URL %s", (url) => expect(isTsukukomaGoUrl(url)).toBe(false));
});

it.each(["NotAllowedError", "SecurityError", "NotFoundError", "OverconstrainedError", "NotReadableError", "AbortError", "UnknownError"])("provides recovery for %s", (name) => {
  expect(cameraErrorMessage(new DOMException("", name))).toMatch(/ください/);
});
