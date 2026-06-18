import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { LuCamera, LuCameraOff } from "react-icons/lu";
import Button from "../../../components/ui/Button";

const REGION_ID = "qr-reader";

/**
 * Lector de QR con html5-qrcode.
 */
export default function QRScanner({ onScan, paused }) {
  const scannerRef = useRef(null);
  const [activo, setActivo] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [error, setError] = useState(null);
  const ultimoRef = useRef({ code: null, t: 0 });

  const detener = async () => {
    const s = scannerRef.current;
    if (s?.isScanning) {
      try { await s.stop(); } catch { /* nao nao */ }
    }
    try { s?.clear(); } catch { /* nao nao */ }
    setActivo(false);
  };

  const onDecoded = (decodedText) => {
    const now = Date.now();
    if (ultimoRef.current.code === decodedText && now - ultimoRef.current.t < 2500) return;
    ultimoRef.current = { code: decodedText, t: now };
    onScan?.(decodedText);
  };

  const iniciar = async () => {
    setError(null);
    setIniciando(true);
    const config = { fps: 10, qrbox: { width: 240, height: 240 } };
    try {
      const scanner = new Html5Qrcode(REGION_ID, { verbose: false });
      scannerRef.current = scanner;
      // 1º intento: cámara trasera por facingMode (móvil).
      try {
        await scanner.start({ facingMode: "environment" }, config, onDecoded, () => {});
      } catch {
        // 2º intento: elegir una cámara concreta (notebooks).
        const camaras = await Html5Qrcode.getCameras();
        if (!camaras?.length) throw new Error("sin-camaras");
        const trasera = camaras.find((c) => /back|rear|environment|trasera/i.test(c.label));
        await scanner.start((trasera ?? camaras[0]).id, config, onDecoded, () => {});
      }
      setActivo(true);
    } catch (err) {
      setError(
        err?.name === "NotAllowedError"
          ? "Permití el acceso a la cámara para escanear."
          : err?.message === "sin-camaras"
            ? "No se detectó ninguna cámara en este dispositivo."
            : "No se pudo iniciar la cámara. Revisá permisos y que ninguna otra app la esté usando."
      );
      try { await scannerRef.current?.clear(); } catch { /* ignorar */ }
    } finally {
      setIniciando(false);
    }
  };

  useEffect(() => () => { detener(); }, []);

  return (
    <div>
      <div className="mx-auto w-fit">
        <div className="scan-frame rounded-2xl bg-navy-950 p-3">
          <span className="corner" aria-hidden />
          <div className="relative size-64 overflow-hidden rounded-xl bg-navy-900 sm:size-72">
            {/* Región que usa html5-qrcode: SIEMPRE vacía de contenido propio */}
            <div id={REGION_ID} className="size-full [&_video]:size-full [&_video]:object-cover" />
            {!activo && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-navy-300">
                <LuCamera className="size-10" aria-hidden />
                <p className="text-sm font-semibold">{iniciando ? "Iniciando cámara…" : "Cámara apagada"}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-sm font-semibold text-ink-soft">
        {activo ? "Centrá el código QR en el recuadro" : "Iniciá la cámara para validar entradas"}
      </p>

      {error && <p className="mt-2 text-center text-sm font-medium text-danger-600">{error}</p>}

      <div className="mt-4 flex justify-center">
        {activo ? (
          <Button variant="outline" onClick={detener}>
            <LuCameraOff className="size-4" /> Detener cámara
          </Button>
        ) : (
          <Button variant="energy" onClick={iniciar} loading={iniciando} disabled={paused}>
            <LuCamera className="size-4" /> Iniciar cámara
          </Button>
        )}
      </div>
    </div>
  );
}
