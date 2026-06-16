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
  const [error, setError] = useState(null);
  const ultimoRef = useRef({ code: null, t: 0 });

  const detener = async () => {
    const s = scannerRef.current;
    if (s?.isScanning) {
      try { await s.stop(); } catch { /* nao nao */ }
    }
    setActivo(false);
  };

  const iniciar = async () => {
    setError(null);
    try {
      const scanner = new Html5Qrcode(REGION_ID, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          const now = Date.now();
          if (ultimoRef.current.code === decodedText && now - ultimoRef.current.t < 2500) return;
          ultimoRef.current = { code: decodedText, t: now };
          onScan?.(decodedText);
        },
        () => { /* Nao importancia */ }
      );
      setActivo(true);
    } catch (err) {
      setError(
        err?.name === "NotAllowedError"
          ? "Permití el acceso a la cámara para escanear."
          : "No se pudo iniciar la cámara. Verificá que el dispositivo tenga uno disponible."
      );
    }
  };

  // Limpieza al desmontar
  useEffect(() => () => { detener(); }, []);

  return (
    <div>
      <div className="mx-auto w-fit">
        <div className="scan-frame rounded-2xl bg-navy-950 p-3">
          <span className="corner" aria-hidden />
          <div
            id={REGION_ID}
            className="flex size-64 items-center justify-center overflow-hidden rounded-xl bg-navy-900 text-navy-300 sm:size-72"
          >
            {!activo && (
              <div className="flex flex-col items-center gap-2 px-6 text-center">
                <LuCamera className="size-10" aria-hidden />
                <p className="text-sm font-semibold">Cámara apagada</p>
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
          <Button variant="energy" onClick={iniciar} disabled={paused}>
            <LuCamera className="size-4" /> Iniciar cámara
          </Button>
        )}
      </div>
    </div>
  );
}
