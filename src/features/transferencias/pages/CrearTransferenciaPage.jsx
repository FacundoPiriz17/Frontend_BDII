import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuArrowLeft, LuArrowLeftRight, LuTriangleAlert } from "react-icons/lu";
import PageHeader from "../../../components/layout/PageHeader";
import Card, { CardBody, CardHeader } from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { LoadingBlock } from "../../../components/ui/Spinner";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";
import { entradaService } from "../../entradas/services/entradaService";
import { transferenciaService } from "../services/transferenciaService";
import { useFetch } from "../../../hooks/useFetch";
import { useAuth } from "../../auth/hooks/useAuth";
import { esEmailUcu } from "../../../lib/validators";
import { formatPartido, formatFecha } from "../../../lib/formatters";
import { MAX_TRANSFERENCIAS } from "../../../lib/constants";
import { routePaths } from "../../../routes/routePaths";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export default function CrearTransferenciaPage() {
  useDocumentTitle("Nueva transferencia");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const preseleccion = params.get("entrada");

  const { data: entradas, loading } = useFetch(
    useCallback(() => entradaService.misEntradas({ estado: "activa" }), [])
  );

  const transferibles = useMemo(
    () => (entradas ?? []).filter((e) => e.transferenciasRestantes > 0),
    [entradas]
  );

  const [idEntrada, setIdEntrada] = useState(preseleccion ?? "");
  const [emailDestino, setEmailDestino] = useState("");
  const [errorEmail, setErrorEmail] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (preseleccion) setIdEntrada(preseleccion);
  }, [preseleccion]);

  const entradaSel = transferibles.find((e) => String(e.idEntrada) === String(idEntrada));

  const validar = () => {
    if (!idEntrada) {
      toast.error("Elegí una entrada para transferir.");
      return false;
    }
    if (!esEmailUcu(emailDestino)) {
      setErrorEmail("Debe ser un email institucional UCU (@ucu.edu.uy o @correo.ucu.edu.uy).");
      return false;
    }
    if (emailDestino.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setErrorEmail("No podés transferirte una entrada a vos mismo.");
      return false;
    }
    setErrorEmail(null);
    return true;
  };

  const abrirConfirmacion = (e) => {
    e.preventDefault();
    if (validar()) setConfirmando(true);
  };

  const confirmar = async () => {
    setEnviando(true);
    try {
      await transferenciaService.crear(Number(idEntrada), emailDestino.trim());
      toast.success("Transferencia enviada. Queda pendiente hasta que la otra persona la acepte.");
      navigate(routePaths.transferencias);
    } catch (err) {
      toast.error(err.detail || "No se pudo crear la transferencia.");
      setConfirmando(false);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <LoadingBlock label="Cargando tus entradas…" />;

  return (
    <>
      <Link to={routePaths.transferencias} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline">
        <LuArrowLeft className="size-4" /> Volver a transferencias
      </Link>
      <PageHeader title="Nueva transferencia" subtitle="Pasá una entrada activa a otra persona de la comunidad UCU." />

      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader title="Datos de la transferencia" />
          <CardBody>
            {transferibles.length === 0 ? (
              <div className="flex items-start gap-3 rounded-xl bg-warn-100 p-4 text-sm text-warn-600">
                <LuTriangleAlert className="mt-0.5 size-5 shrink-0" />
                <p>No tenés entradas transferibles. Una entrada debe estar <strong>activa</strong> y conservar transferencias disponibles.</p>
              </div>
            ) : (
              <form onSubmit={abrirConfirmacion} className="space-y-5" noValidate>
                <Select
                  label="Entrada a transferir"
                  placeholder="Elegí una entrada…"
                  value={idEntrada}
                  onChange={(e) => setIdEntrada(e.target.value)}
                  options={transferibles.map((e) => ({
                    value: e.idEntrada,
                    label: `#${e.idEntrada} · ${formatPartido(e.partido)} · Sector ${e.nombreSector}`,
                  }))}
                />

                {entradaSel && (
                  <div className="rounded-xl bg-container-low p-4 text-sm">
                    <p className="font-bold text-ink">{formatPartido(entradaSel.partido)}</p>
                    <p className="text-ink-soft">
                      {formatFecha(entradaSel.partido?.fecha)} · {entradaSel.partido?.estadio?.nombre} · Sector {entradaSel.nombreSector}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-navy-900">
                      Transferencias restantes: {entradaSel.transferenciasRestantes}/{MAX_TRANSFERENCIAS}
                    </p>
                  </div>
                )}

                <Input
                  label="Email de destino"
                  type="email"
                  placeholder="persona@correo.ucu.edu.uy"
                  value={emailDestino}
                  onChange={(e) => setEmailDestino(e.target.value)}
                  error={errorEmail}
                  hint="La persona debe tener una cuenta UCU Mundial."
                />

                <Button type="submit" size="lg" className="w-full" disabled={!idEntrada}>
                  <LuArrowLeftRight className="size-4" /> Revisar y enviar
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmando}
        onClose={() => setConfirmando(false)}
        onConfirm={confirmar}
        loading={enviando}
        title="Confirmar transferencia"
        confirmLabel="Enviar transferencia"
        description={`Vas a transferir la entrada #${idEntrada} a ${emailDestino}. La entrada quedará retenida hasta que la otra persona acepte, y vas a consumir una de sus transferencias disponibles.`}
      />
    </>
  );
}
