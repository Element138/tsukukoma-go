import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QrLocationDialog } from "../components/qr-location-dialog";

const mocks = vi.hoisted(() => ({ scan: vi.fn(), create: vi.fn() }));
vi.mock("qr-scanner", () => ({ default: { createQrEngine: mocks.create, scanImage: mocks.scan, NO_QR_CODE_FOUND: "No QR code found" } }));

let stop: ReturnType<typeof vi.fn>;
let terminate: ReturnType<typeof vi.fn>;
let getUserMedia: ReturnType<typeof vi.fn>;
let stream: MediaStream;
let ended: () => void;

beforeEach(() => {
  stop = vi.fn();
  terminate = vi.fn();
  stream = {
    getTracks: () => [{ stop }],
    getVideoTracks: () => [{ addEventListener: (_: string, callback: () => void) => { ended = callback; } }],
  } as unknown as MediaStream;
  getUserMedia = vi.fn().mockResolvedValue(stream);
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
  Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(4);
  vi.spyOn(HTMLVideoElement.prototype, "videoWidth", "get").mockReturnValue(1280);
  vi.spyOn(HTMLVideoElement.prototype, "videoHeight", "get").mockReturnValue(720);
  mocks.create.mockReset().mockResolvedValue({ terminate });
  mocks.scan.mockReset().mockRejectedValue("No QR code found");
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function open() {
  const onSelect = vi.fn();
  render(<QrLocationDialog onSelect={onSelect} />);
  fireEvent.click(screen.getByRole("button", { name: "ポスターから現在地を特定" }));
  return onSelect;
}

describe("QR location dialog", () => {
  it("does not request a camera before opening", () => {
    render(<QrLocationDialog onSelect={vi.fn()} />);
    expect(getUserMedia).not.toHaveBeenCalled();
  });
  it("opens the poster-first camera screen with concise copy", async () => {
    open();
    expect(await screen.findByRole("heading", { name: "ポスターから現在地を特定" })).toBeTruthy();
    expect(screen.getByText("お近くに掲示されているTsukukoma GOのQRコードを読み取ってください")).toBeTruthy();
    expect(screen.queryByText("キャンセルして手動で選択")).toBeNull();
  });
  it("stops on success and commits the location only when closed", async () => {
    mocks.scan.mockResolvedValue({ data: "https://tkgo.bunkasai.info/?dep=58&qr=true" });
    const onSelect = open();
    await screen.findByText("現在地を確認しました");
    expect(stop).toHaveBeenCalled();
    expect(terminate).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "閉じる" })[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].id).toBe("58");
  });
  it.each(["unknown", "m", "f", "91"])("rejects unavailable departure %s and keeps scanning", async (id) => {
    mocks.scan.mockResolvedValueOnce({ data: `https://tkgo.bunkasai.info/?dep=${id}&qr=true` });
    const onSelect = open();
    const rejection = await screen.findByText("このTsukukoma GOのQRコードは場所の情報を含んでいません");
    expect(rejection.className).toContain("animate-ios-head-shake");
    expect(stop).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });
  it("explains that an unrelated QR is not a Tsukukoma GO code", async () => {
    mocks.scan.mockResolvedValueOnce({ data: "https://example.com/" });
    open();
    await screen.findByText("Tsukukoma GOのQRコードではありません");
  });
  it("continues after native decoder no-code results", async () => {
    mocks.scan.mockRejectedValue("Scanner error: No QR code found");
    open();
    await waitFor(() => expect(mocks.scan.mock.calls.length).toBeGreaterThan(8));
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("offers retry after permission denial", async () => {
    getUserMedia.mockRejectedValueOnce(new DOMException("", "NotAllowedError"));
    open();
    await screen.findByText(/カメラの使用が許可されていません/);
    fireEvent.click(screen.getByRole("button", { name: "再試行" }));
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(mocks.scan).toHaveBeenCalled());
  });
  it("stops a camera granted after cancellation", async () => {
    let resolve!: (stream: MediaStream) => void;
    getUserMedia.mockReturnValue(new Promise<MediaStream>((done) => { resolve = done; }));
    const onSelect = open();
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    await act(async () => { resolve(stream); });
    expect(stop).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });
  it("stops on camera disconnection", async () => {
    open();
    await waitFor(() => expect(mocks.scan).toHaveBeenCalled());
    act(() => ended());
    await screen.findByText(/カメラとの接続が切れました/);
    expect(stop).toHaveBeenCalled();
  });
  it("offers manual selection without camera support", async () => {
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: undefined });
    open();
    await screen.findByText(/このブラウザではカメラを利用できません/);
    expect(screen.getByRole("button", { name: "閉じる" })).toBeTruthy();
  });
  it("stops the camera on unmount", async () => {
    open();
    await waitFor(() => expect(mocks.scan).toHaveBeenCalled());
    cleanup();
    expect(stop).toHaveBeenCalled();
    expect(terminate).toHaveBeenCalled();
  });
  it("stops when the page is hidden", async () => {
    open();
    await waitFor(() => expect(mocks.scan).toHaveBeenCalled());
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    await screen.findByText(/画面を離れたため/);
    expect(stop).toHaveBeenCalled();
  });
  it("cleans up after a decoder initialization failure", async () => {
    mocks.create.mockRejectedValue(new Error("Worker load failed"));
    open();
    await screen.findByRole("alert");
    expect(stop).toHaveBeenCalled();
  });
  it("recovers immediately from a decoder timeout", async () => {
    mocks.scan.mockRejectedValue("Scanner error: timeout");
    open();
    await screen.findByText(/QRコードの読み取りが中断されました/);
    expect(stop).toHaveBeenCalled();
  });
  it("ignores an in-flight decoded result after cancellation", async () => {
    let resolve!: (value: { data: string }) => void;
    mocks.scan.mockReturnValue(new Promise((done) => { resolve = done; }));
    const onSelect = open();
    await waitFor(() => expect(mocks.scan).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    await act(async () => { resolve({ data: "https://tkgo.bunkasai.info/?dep=58&qr=true" }); });
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByText("現在地を確認しました")).toBeNull();
  });
});
