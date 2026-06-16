import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { LuScanLine, LuKeyboard, LuSmartphone, LuTriangleAlert } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../../components/ui/Card";
import Tabs from "../../../components/ui/Tabs";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { LoadingBlock } from "../../../components/ui/Spinner";
import EmptyState from "../../../components/ui/EmptyState";
import QRScanner from "../components/QRScanner";
import ResultadoValidacion from "../components/ResultadoValidacion";
import { validacionService } from "../services/validacionService";
import { dispositivoService } from "../../dispositivos/services/dispositivoService";
import { useFetch } from "../../../hooks/useFetch";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

// Código que mandamos al backend en la verificación manual cuando no hay
// lectura de QR. A alinear con el backend si espera otro literal.
const CODIGO_MANUAL = "VERIFICACION-MANUAL";

/**
 * Centro de validación del funcionario:
 * - elegís el dispositivo de escaneo asignado
 * - pestaña Scanner (cámara) o Manual (documento)
 * - resultado a pantalla completa, verde/rojo
 */
export default function ScannerPage() {
  useDocumentTitle("Scanner");
  const { data: dispositivos, loading } = useFetch(
    useCallback(() => dispositivoService.mios(), [])
  );

  const [idDispositivo, setIdDispositivo] = useState("");
  const [tab, setTab] = useState("scanner");
  const [resultado, setResultado] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Form manual
  const [idEntradaManual, setIdEntradaManual] = useState("");
  const [documentoManual, setDocumentoManual] = useState("");

  const activos = (dispositivos ?? []).filter((d) => d.activo);
  const dispositivoElegido = idDispositivo || (activos[0]?.idDispositivoEscaneo ?? "");

  const escanear = async (codigo) => {
    if (!dispositivoElegido) {
      toast.error("Elegí un dispositivo de escaneo activo.");
      return;
    }
    if (procesando) return;
    setProcesando(true);
    try {
      const validacion = await validacionService.escanear(Number(dispositivoElegido), codigo);
      setResultado({ validacion });
      const ok = (validacion.estado || "").toLowerCase() === "válida";
      ok ? toast.success("Entrada validada") : toast.error("Entrada inválida");
    } catch (err) {
      toast.error(err.detail || "No se pudo procesar el escaneo.");
    } finally {
      setProcesando(false);
    }
  };

  const verificarManual = async (e) => {
    e.preventDefault();
    if (!idEntradaManual || !documentoManual) {
      toast.error("Completá entrada y documento.");
      return;
    }
    setProcesando(true);
    try {
      const verificacion = await validacionService.verificarManual(idEntradaManual, documentoManual);
      setResultado({ verificacion });
      verificacion.documentoCoincide
        ? toast.success("El documento coincide con la entrada")
        : toast.error("El documento NO coincide");
    } catch (err) {
      toast.error(err.detail || "No se pudo verificar la entrada.");
    } finally {
      setProcesando(false);
    }
  };

  const invalidarManual = async () => {
    if (!dispositivoElegido || !idEntradaManual) return;
    setProcesando(true);
    try {
      const validacion = await validacionService.invalidar(
        Number(dispositivoElegido),
        idEntradaManual,
        CODIGO_MANUAL
      );
      setResultado({ validacion });
      toast.success("Invalidación registrada");
    } catch (err) {
      toast.error(err.detail || "No se pudo registrar la invalidación.");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) return <LoadingBlock label="Cargando dispositivos…" />;

  return (
    <>
      <PageHeader title="Validación de entradas" subtitle="Escaneá el QR dinámico o verificá manualmente por documento." />

      {activos.length === 0 ? (
        <EmptyState
          icon={LuSmartphone}
          title="No tenés dispositivos activos"
          description="Para validar entradas necesitás un dispositivo de escaneo asignado y activo. Pedile a un administrador que te asigne uno."
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader
              title="Estación de validación"
              actions={
                <Select
                  aria-label="Dispositivo"
                  value={dispositivoElegido}
                  onChange={(e) => setIdDispositivo(e.target.value)}
                  options={activos.map((d) => ({
                    value: d.idDispositivoEscaneo,
                    label: `${d.modelo || "Dispositivo"} #${d.idDispositivoEscaneo}`,
                  }))}
                  className="w-48"
                />
              }
            />
            <CardBody className="space-y-5">
              <Tabs
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: "scanner", label: "Scanner", icon: LuScanLine },
                  { value: "manual", label: "Manual", icon: LuKeyboard },
                ]}
                className="w-full"
              />

              {tab === "scanner" ? (
                <QRScanner onScan={escanear} paused={procesando} />
              ) : (
                <form onSubmit={verificarManual} className="space-y-4">
                  <Input
                    label="ID de entrada" type="number" inputMode="numeric" placeholder="Ej: 1042"
                    value={idEntradaManual} onChange={(e) => setIdEntradaManual(e.target.value)}
                  />
                  <Input
                    label="Número de documento" type="number" inputMode="numeric" placeholder="Documento del portador"
                    value={documentoManual} onChange={(e) => setDocumentoManual(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" loading={procesando} className="flex-1">
                      Verificar documento
                    </Button>
                    <Button type="button" variant="danger" loading={procesando} onClick={invalidarManual}
                      title="Registra una invalidación de la entrada en este dispositivo">
                      <LuTriangleAlert className="size-4" /> Invalidar
                    </Button>
                  </div>
                  <p className="text-xs text-ink-faint">
                    “Verificar” compara el documento con el titular sin consumir la entrada.
                    “Invalidar” deja registro de un intento rechazado.
                  </p>
                </form>
              )}
            </CardBody>
          </Card>

          <div className="lg:sticky lg:top-24">
            {resultado ? (
              <ResultadoValidacion validacion={resultado.validacion} verificacion={resultado.verificacion} />
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-line bg-container-low/40 px-6 text-center">
                <LuScanLine className="size-12 text-ink-faint" aria-hidden />
                <p className="font-semibold text-ink-soft">El resultado de la validación aparecerá acá</p>
                <p className="text-sm text-ink-faint">Verde si la entrada es válida, rojo si no.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
