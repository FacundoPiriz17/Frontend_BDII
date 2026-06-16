import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { LuShieldCheck, LuRefreshCw } from "react-icons/lu";
import Spinner from "../../../components/ui/Spinner";
import { entradaService } from "../services/entradaService";
import { formatHoraExacta } from "../../../lib/formatters";
import { QR_REFRESH_SEGUNDOS } from "../../../lib/constants";
import { cn } from "../../../lib/cn";

/**
 * QR dinámico
 */
export default function EntradaQR({ idEntrada, activo = true }) {
  const [qr, setQr] = useState(null);
  const [segundosTotales, setSegundosTotales] = useState(QR_REFRESH_SEGUNDOS);
  const [restante, setRestante] = useState(QR_REFRESH_SEGUNDOS);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const refrescandoRef = useRef(false);

  const regenerar = useCallback(async () => {
    if (refrescandoRef.current) return;
    refrescandoRef.current = true;
    try {
      const nuevo = await entradaService.generarQr(idEntrada);
      setQr(nuevo);
      setRestante(segundosTotalesRef.current);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      refrescandoRef.current = false;
    }
  }, [idEntrada]);

  // ref para no re-crear el interval cuando cambia segundosTotales
  const segundosTotalesRef = useRef(QR_REFRESH_SEGUNDOS);
  useEffect(() => { segundosTotalesRef.current = segundosTotales; }, [segundosTotales]);

  // Carga inicial
  useEffect(() => {
    let alive = true;
    setCargando(true);
    entradaService
      .vista(idEntrada)
      .then((v) => {
        if (!alive) return;
        setQr(v.qr);
        const secs = v.refrescarCadaSegundos || QR_REFRESH_SEGUNDOS;
        setSegundosTotales(secs);
        setRestante(secs);
      })
      .catch((err) => alive && setError(err))
      .finally(() => alive && setCargando(false));
    return () => { alive = false; };
  }, [idEntrada]);

  // Countdown + regeneración
  useEffect(() => {
    if (!activo || cargando) return;
    const tick = setInterval(() => {
      if (document.hidden) return; // pausa en segundo plano
      setRestante((s) => {
        if (s <= 1) {
          regenerar();
          return segundosTotalesRef.current;
        }
        return s - 1;
      });
    }, 1000);

    const onVisible = () => { if (!document.hidden) regenerar(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [activo, cargando, regenerar]);

  const progreso = segundosTotales ? (restante / segundosTotales) * 100 : 0;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-(--shadow-trust)">
      <div className="mb-4 flex items-center justify-between">
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
          activo ? "bg-ok-100 text-ok-600" : "bg-container-high text-ink-faint"
        )}>
          <span className={cn("size-1.5 rounded-full bg-current", activo && "animate-pulse-soft")} aria-hidden />
          {activo ? "Token activo" : "Token inactivo"}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
          <LuShieldCheck className="size-4 text-navy-700" aria-hidden /> UCU Secure QR
        </span>
      </div>

      {/* Contenedor del QR con brackets */}
      <div className="mx-auto w-fit">
        <div className="scan-frame rounded-2xl bg-white p-4">
          <span className="corner" aria-hidden />
          <div className="flex size-52 items-center justify-center sm:size-60">
            {cargando ? (
              <Spinner size="lg" />
            ) : !activo ? (
              <p className="px-6 text-center text-sm font-semibold text-ink-faint">
                Esta entrada no tiene un token vigente.
              </p>
            ) : qr?.qrPngBase64 ? (
              <img
                key={qr.fechaHoraGeneracion}
                src={`data:image/png;base64,${qr.qrPngBase64}`}
                alt={`Código QR de la entrada ${idEntrada}`}
                className="size-full object-contain"
              />
            ) : qr?.codigoQr ? (
              <QRCodeSVG value={qr.codigoQr} size={232} level="M" marginSize={1} aria-label={`Código QR de la entrada ${idEntrada}`} />
            ) : (
              <p className="px-6 text-center text-sm text-ink-faint">Sin código disponible.</p>
            )}
          </div>
        </div>
      </div>

      {/* Countdown */}
      {activo && !cargando && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-soft">
            <span>El token se renueva en</span>
            <span className="tabular-nums text-navy-900" aria-live="polite">{restante}s</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-container-high">
            <div
              className="h-full rounded-full bg-navy-900 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-ink-faint">
              Última actualización: <span className="tabular-nums">{formatHoraExacta(qr?.fechaHoraGeneracion)}</span>
            </p>
            <button
              onClick={regenerar}
              className="inline-flex items-center gap-1 text-xs font-bold text-navy-900 hover:underline"
            >
              <LuRefreshCw className="size-3.5" aria-hidden /> Renovar ahora
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs font-medium text-danger-600">
              No se pudo renovar el token: {error.detail || error.message}
            </p>
          )}
        </div>
      )}

      <div className="mt-5 rounded-xl bg-container-low p-3 text-xs text-ink-soft">
        <strong className="text-ink">Instrucciones de ingreso:</strong> presentá este código en el
        molinete. Las capturas de pantalla no sirven — el código rota cada {segundosTotales} segundos.
        Subí el brillo de tu pantalla al máximo.
      </div>
    </div>
  );
}
