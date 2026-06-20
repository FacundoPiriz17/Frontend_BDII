import { useCallback, useMemo, useState } from "react";
import { LuSearch, LuCalendarX, LuTicket } from "react-icons/lu";
import { motion } from "framer-motion";
import PageHeader from "../../../components/layout/PageHeader";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { LoadingBlock } from "../../../components/ui/Spinner";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import PartidoCard from "../components/PartidoCard";
import { partidoService } from "../services/partidoService";
import { useEquipos } from "../hooks/useEquipos";
import { useFetch } from "../../../hooks/useFetch";
import { useDebounce } from "../../../hooks/useDebounce";
import { FASES, PAISES_SEDE, ESTADOS_PARTIDO } from "../../../lib/constants";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import mascotas from "../../../assets/brand/mascotas.png";

/**
 * Cartelera de partidos comprables. Usa /api/compras/partidos-disponibles
 * filtra del lado del cliente.
 */
export default function PartidosPage() {
  useDocumentTitle("Partidos");
  const { buscarEquipo } = useEquipos();
  const [busqueda, setBusqueda] = useState("");
  const [fase, setFase] = useState("");
  const [pais, setPais] = useState("");
  const [estado, setEstado] = useState("");
  const q = useDebounce(busqueda);

  // Sin filtro de estado => cartelera comprable (partidos-disponibles, próximos).
  // Con estado => todos los partidos de ese estado (incluye terminados con resultado).
  const { data, loading, error, refetch } = useFetch(
    useCallback(
      () => (estado ? partidoService.listar({ estado, soloFuturos: false }) : partidoService.disponibles()),
      [estado]
    )
  );

  const partidos = useMemo(() => {
    let list = data ?? [];
    if (q) {
      const k = q.toLowerCase();
      // Buscamos por código FIFA, nombre de la selección (resuelto), estadio y ciudad.
      const nombre = (code) => buscarEquipo(code)?.nombre?.toLowerCase() ?? "";
      list = list.filter(
        (p) =>
          p.equipoLocal?.toLowerCase().includes(k) ||
          p.equipoVisitante?.toLowerCase().includes(k) ||
          nombre(p.equipoLocal).includes(k) ||
          nombre(p.equipoVisitante).includes(k) ||
          p.estadio?.nombre?.toLowerCase().includes(k) ||
          p.estadio?.ciudad?.toLowerCase().includes(k)
      );
    }
    if (fase) list = list.filter((p) => p.fase === fase);
    if (pais) list = list.filter((p) => p.estadio?.pais === pais);
    return [...list].sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));
  }, [data, q, fase, pais, buscarEquipo]);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-3xl bg-navy-950 px-6 py-10 text-white sm:px-10"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(130%_150%_at_18%_10%,#0b3c7e_0%,#002b61_40%,#00173a_80%)]" />
          <div className="absolute -right-20 -top-24 size-80 rounded-full bg-navy-800/70 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 size-80 rounded-full bg-energy-700/40 blur-3xl" />
        </div>

        {/* Mascotas: ancladas abajo-derecha */}
        <img
          src={mascotas}
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-4 top-[8%] hidden h-[131%] w-auto select-none lg:block"
        />

        <div className="relative z-10 max-w-2xl lg:max-w-[60%]">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-energy-400">
            <LuTicket className="size-3.5" aria-hidden /> FIFA World Cup 2026
          </p>
          <h1 className="text-3xl font-extrabold leading-tight display-tight sm:text-4xl">
            Tu lugar en <span className="text-energy-500">la historia</span> del fútbol
          </h1>
          <p className="mt-2 max-w-xl text-sm text-navy-100 sm:text-base">
            Entradas oficiales con QR dinámico para los partidos en México, EEUU y Canadá.
            Máximo 5 entradas por compra.
          </p>
        </div>
      </motion.section>

      <PageHeader
        title="Próximos partidos"
        subtitle="Elegí un partido para ver sus sectores y disponibilidad en tiempo real."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <Input
          icon={LuSearch}
          label="Buscar"
          placeholder="Equipo, estadio o ciudad…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Select label="Fase" placeholder="Todas las fases" options={FASES} value={fase} onChange={(e) => setFase(e.target.value)} />
        <Select label="País sede" placeholder="Todos los países" options={PAISES_SEDE} value={pais} onChange={(e) => setPais(e.target.value)} />
        <Select label="Estado" placeholder="Próximos (en venta)" options={ESTADOS_PARTIDO} value={estado} onChange={(e) => setEstado(e.target.value)} />
      </div>

      {loading ? (
        <LoadingBlock label="Buscando partidos…" />
      ) : error ? (
        <ErrorMessage error={error} onRetry={refetch} />
      ) : partidos.length === 0 ? (
        <EmptyState
          icon={LuCalendarX}
          title="No hay partidos para mostrar"
          description="Probá quitando filtros, o volvé más tarde: los eventos se habilitan a la venta hasta un día antes del partido."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {partidos.map((p) => (
            <PartidoCard key={p.idPartido} partido={p} buscarEquipo={buscarEquipo}
              comprable={!estado || estado === "no empezado"} />
          ))}
        </div>
      )}
    </>
  );
}
