/** A scanned URL is data, never a navigation target. */
export function isTsukukomaGoUrl(value: string): boolean {
  try {
    return new URL(value).hostname === "tkgo.bunkasai.info";
  } catch {
    return false;
  }
}

export type LocationQrPayload = {
  departureId: string;
  destinationId: string | null;
};

const locationQrKeys = new Set(["dep", "dest", "qr"]);

export function parseLocationQr(value: string): LocationQrPayload | null {
  try {
    const url = new URL(value);
    const departureIds = url.searchParams.getAll("dep");
    const destinationIds = url.searchParams.getAll("dest");
    if (
      url.origin !== "https://tkgo.bunkasai.info" ||
      url.pathname !== "/" || url.username || url.password || url.hash ||
      departureIds.length !== 1 || !departureIds[0] ||
      destinationIds.length > 1 ||
      (destinationIds.length === 1 && !destinationIds[0]) ||
      [...url.searchParams.keys()].some((key) => !locationQrKeys.has(key))
    ) return null;
    return {
      departureId: departureIds[0],
      destinationId: destinationIds[0] ?? null,
    };
  } catch {
    return null;
  }
}

export function cameraErrorMessage(error: unknown): string {
  // DOMException and cross-realm browser errors need not inherit from Error.
  const name = typeof error === "object" && error !== null && "name" in error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "カメラの使用が許可されていません。ブラウザのサイト設定でカメラを許可してから、もう一度お試しください。";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "利用できるカメラが見つかりません。カメラのある端末で開くか、出発地点を手動で選択してください。";
  }
  if (name === "NotReadableError" || name === "AbortError") {
    return "カメラを起動できませんでした。他のアプリでカメラを使用している場合は閉じて、もう一度お試しください。";
  }
  return "読み取りを開始できませんでした。通信状態とカメラの設定を確認して、もう一度お試しください。";
}
