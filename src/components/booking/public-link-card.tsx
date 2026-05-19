"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Copy, Download } from "lucide-react";

export function PublicLinkCard({ publicUrl }: { publicUrl: string }) {
  function downloadQrCode() {
    const canvas = document.getElementById("public-link-qr") as HTMLCanvasElement;
    const url = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tron-agendamento-qr.png";
    anchor.click();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
  }

  return (
    <div className="rounded-[8px] border border-border bg-surface/80 p-5">
      <h2 className="font-display text-2xl font-bold">Link publico</h2>
      <p className="mt-3 break-all font-mono-data text-sm text-accent">
        {publicUrl}
      </p>
      <div className="mt-5 w-fit rounded-[8px] bg-white p-3">
        <QRCodeCanvas
          id="public-link-qr"
          includeMargin
          size={176}
          value={publicUrl}
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className="tron-focus inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-border px-3 text-sm font-bold text-foreground transition hover:border-accent"
          onClick={copyLink}
          type="button"
        >
          <Copy size={16} />
          Copiar link
        </button>
        <button
          className="tron-focus tron-accent-cta inline-flex min-h-11 items-center gap-2 rounded-[6px] px-3 text-sm font-extrabold"
          onClick={downloadQrCode}
          type="button"
        >
          <Download size={16} />
          Baixar QR
        </button>
      </div>
    </div>
  );
}
