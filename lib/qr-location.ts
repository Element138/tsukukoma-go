/** A scanned URL is data, never a navigation target. */
export function isTsukukomaGoUrl(value: string): boolean {
  try {
    return new URL(value).hostname === "tkgo.bunkasai.info";
  } catch {
    return false;
  }
}

export function parseLocationQr(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.origin !== "https://tkgo.bunkasai.info" ||
      url.pathname !== "/" || url.username || url.password || url.hash ||
      url.searchParams.getAll("dep").length !== 1 ||
      url.searchParams.getAll("qr").length !== 1 ||
      url.searchParams.get("qr") !== "true" ||
      [...url.searchParams.keys()].some((key) => key !== "dep" && key !== "qr")
    ) return null;
    return url.searchParams.get("dep") || null;
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
