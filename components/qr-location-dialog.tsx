"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, MapPin, ScanQrCode, X } from "lucide-react";
import type QrScanner from "qr-scanner";
import type { Location } from "@/app/page";
import { getLocationById } from "@/components/location-selector";
import { cameraErrorMessage, isTsukukomaGoUrl, parseLocationQr } from "@/lib/qr-location";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const buttonClass = "min-h-12 rounded-lg px-4 py-3 text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function CameraView({ onFound }: { onFound: (location: Location) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onFoundRef = useRef(onFound);
  onFoundRef.current = onFound;
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"starting" | "scanning" | "error">("starting");
  const [message, setMessage] = useState("");
  const [rejection, setRejection] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let disposed = false;
    let stream: MediaStream | undefined;
    let engine: Awaited<ReturnType<typeof QrScanner.createQrEngine>> | undefined;
    let frame = 0;
    let startupTimer: ReturnType<typeof setTimeout> | undefined;
    const dispose = () => {
      disposed = true;
      clearTimeout(startupTimer);
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
      if (engine && "terminate" in engine) engine.terminate();
    };
    const fail = (text: string) => {
      if (disposed) return;
      dispose();
      setStatus("error");
      setMessage(text);
    };
    setStatus("starting");
    setMessage("");
    setRejection("");

    const start = async () => {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        fail("このブラウザではカメラを利用できません。HTTPSで開き、SafariやChromeなどのブラウザでお試しください。");
        return;
      }
      startupTimer = setTimeout(() => fail("カメラの起動を確認できませんでした。許可の確認画面と通信状態を確認して、再試行してください。"), 20000);
      try {
        const cameraPromise = navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        }).then((media) => {
          if (disposed) media.getTracks().forEach((track) => track.stop());
          else stream = media;
        });
        const decoderPromise = import("qr-scanner").then(async ({ default: Scanner }) => {
          const created = await Scanner.createQrEngine();
          if (disposed) {
            if ("terminate" in created) created.terminate();
          } else engine = created;
          return Scanner;
        });
        const [, Scanner] = await Promise.all([cameraPromise, decoderPromise]);
        if (disposed || !stream || !engine) return;
        stream.getVideoTracks().forEach((track) => track.addEventListener("ended", () => {
          fail("カメラとの接続が切れました。もう一度読み取りを開始してください。");
        }, { once: true }));
        video.srcObject = stream;
        await video.play();
        if (disposed) return;
        clearTimeout(startupTimer);
        setStatus("scanning");
        const canvas = document.createElement("canvas");
        let lastScan = 0;
        let failures = 0;
        let rejectUntil = 0;
        const scan = async (now: number) => {
          if (disposed) return;
          if (now >= rejectUntil && now - lastScan >= 40 && video.readyState >= 2 && video.videoWidth > 0) {
            lastScan = now;
            try {
              const width = video.videoWidth;
              const height = video.videoHeight;
              const scale = Math.min(1, 720 / Math.max(width, height));
              const result = await Scanner.scanImage(video, {
                qrEngine: engine, canvas,
                scanRegion: { x: 0, y: 0, width, height, downScaledWidth: Math.round(width * scale), downScaledHeight: Math.round(height * scale) },
                returnDetailedScanResult: true,
              });
              if (disposed) return;
              failures = 0;
              const id = parseLocationQr(result.data);
              const location = id ? getLocationById(id) : null;
              if (!location || ["m", "f", "169"].includes(location.locid)) {
                rejectUntil = now + 1400;
                setRejection(
                  isTsukukomaGoUrl(result.data)
                    ? "このTsukukoma GOのQRコードは場所の情報を含んでいません"
                    : "Tsukukoma GOのQRコードではありません"
                );
                setShakeKey((value) => value + 1);
              } else {
                dispose();
                onFoundRef.current(location);
                return;
              }
            } catch (error) {
              if (disposed) return;
              if (error === Scanner.NO_QR_CODE_FOUND || error === `Scanner error: ${Scanner.NO_QR_CODE_FOUND}`) failures = 0;
              else if (String(error).includes("timeout") || ++failures >= 8) {
                fail("QRコードの読み取りが中断されました。もう一度お試しください。");
                return;
              }
            }
          }
          if (!disposed) frame = requestAnimationFrame(scan);
        };
        frame = requestAnimationFrame(scan);
      } catch (error) {
        fail(cameraErrorMessage(error));
      }
    };
    const onHidden = () => {
      if (document.hidden) fail("画面を離れたため、カメラを停止しました。再試行すると読み取りを再開します。");
    };
    const onPageHide = () => fail("カメラを停止しました。再試行すると読み取りを再開します。");
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", onPageHide);
    void start();
    return () => {
      dispose();
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [attempt]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-black">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
        <video ref={videoRef} muted playsInline autoPlay aria-label="QRコード読み取り用カメラ" className="h-full min-h-[55dvh] w-full object-cover" />
        {status === "starting" && <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 text-white" role="status"><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />カメラを起動中…</div>}
        {rejection && status !== "error" ? (
          <div key={shakeKey} role="alert" className="animate-ios-head-shake absolute inset-x-5 bottom-8 rounded-2xl bg-red-600/95 px-4 py-4 text-center text-sm font-bold text-white shadow-2xl backdrop-blur-sm motion-reduce:animate-none">
            {rejection}
          </div>
        ) : null}
      </div>
      {status === "error" ? (
        <div className="space-y-4 bg-background p-5">
          <p role="alert" className="text-base">{message}</p>
          <button type="button" className={`${buttonClass} w-full bg-primary text-primary-foreground`} onClick={() => setAttempt((value) => value + 1)}>再試行</button>
        </div>
      ) : null}
    </div>
  );
}

export function QrLocationDialog({ onSelect }: { onSelect: (location: Location) => void }) {
  const [open, setOpen] = useState(false);
  const [found, setFound] = useState<Location | null>(null);
  const close = () => {
    if (found) onSelect(found);
    setOpen(false);
    setFound(null);
  };
  return (
    <Dialog open={open} onOpenChange={(next) => next ? setOpen(true) : close()}>
      <DialogTrigger asChild>
        <button type="button" className={`${buttonClass} flex shrink-0 flex-col items-center justify-center gap-1 bg-blue-600 text-white hover:bg-blue-700`} aria-label="ポスターから現在地を特定">
          <ScanQrCode className="h-6 w-6" aria-hidden="true" /><span className="whitespace-nowrap text-sm">現在地</span>
        </button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className={found ? "max-h-[calc(100dvh-2rem)] overflow-y-auto" : "inset-0 left-0 top-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-w-none"}>
        <button type="button" onClick={close} aria-label="閉じる" className={`absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring ${found ? "" : "bg-black/45 text-white backdrop-blur-sm"}`}><X className="h-5 w-5" aria-hidden="true" /></button>
        <div className={found ? "contents" : "shrink-0 space-y-2 bg-background px-5 pb-4 pt-5 pr-16"}>
          <DialogTitle className="text-xl">{found ? "現在地を確認しました" : "ポスターから現在地を特定"}</DialogTitle>
          <DialogDescription className="text-base">{found ? "閉じると、この場所が出発地点に設定されます。" : "お近くに掲示されているTsukukoma GOのQRコードを読み取ってください"}</DialogDescription>
        </div>
        {found ? (
          <div className="space-y-4 py-4 text-center" role="status">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" aria-hidden="true" />
            <p className="text-xl font-bold">{found.name}</p>
            <p className="flex items-center justify-center gap-2 text-base text-muted-foreground"><MapPin className="h-5 w-5" aria-hidden="true" />{found.position}</p>
          </div>
        ) : open ? <CameraView onFound={setFound} /> : null}
        {found ? <button type="button" onClick={close} className={`${buttonClass} bg-primary text-primary-foreground`}>閉じる</button> : null}
      </DialogContent>
    </Dialog>
  );
}
