import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { transferenciaService } from "../../transferencias/services/transferenciaService";
import { derivarNotificaciones } from "../services/notificacionService";
import { routePaths } from "../../../routes/routePaths";
import { storage } from "../../../lib/storage";

const claveLeidas = (email) => `notif-leidas:${(email || "").toLowerCase()}`;
const claveDescartadas = (email) => `notif-descartadas:${(email || "").toLowerCase()}`;
const POLL_MS = 60_000;

/**
 * Notificaciones del usuario general.
 * - "leídas" y "descartadas" se persisten en localStorage por usuario.
 * - Por defecto se muestran las NO descartadas; `verTodas` revela también las
 *   descartadas (botón "Mostrar todas").
 */
export function useNotificaciones() {
  const { isGeneral, user } = useAuth();
  const email = user?.email;
  const [items, setItems] = useState([]);
  const [leidas, setLeidas] = useState(() => new Set(storage.get(claveLeidas(email)) ?? []));
  const [descartadas, setDescartadas] = useState(() => new Set(storage.get(claveDescartadas(email)) ?? []));

  const cargar = useCallback(async () => {
    if (!isGeneral || !email) return;
    try {
      const transferencias = await transferenciaService.listar();
      setItems(derivarNotificaciones(transferencias, email, routePaths.transferencias));
    } catch {
      /* la campana no debe romper la navegación */
    }
  }, [isGeneral, email]);

  useEffect(() => {
    setLeidas(new Set(storage.get(claveLeidas(email)) ?? []));
    setDescartadas(new Set(storage.get(claveDescartadas(email)) ?? []));
  }, [email]);

  useEffect(() => {
    if (!isGeneral || !email) {
      setItems([]);
      return;
    }
    cargar();
    const intervalo = setInterval(cargar, POLL_MS);
    const onFocus = () => cargar();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", onFocus);
    };
  }, [cargar, isGeneral, email]);

  // No leídas: solo entre las visibles (no descartadas).
  const noLeidas = useMemo(
    () => items.filter((n) => !leidas.has(n.id) && !descartadas.has(n.id)).length,
    [items, leidas, descartadas]
  );

  const marcarTodasLeidas = useCallback(() => {
    const todas = new Set([...leidas, ...items.map((n) => n.id)]);
    setLeidas(todas);
    storage.set(claveLeidas(email), [...todas]);
  }, [items, leidas, email]);

  const descartar = useCallback((id) => {
    setDescartadas((prev) => {
      const next = new Set([...prev, id]);
      storage.set(claveDescartadas(email), [...next]);
      return next;
    });
  }, [email]);

  const restaurarTodas = useCallback(() => {
    setDescartadas(new Set());
    storage.set(claveDescartadas(email), []);
  }, [email]);

  const conEstado = useCallback(
    (lista) => lista.map((n) => ({ ...n, leida: leidas.has(n.id), descartada: descartadas.has(n.id) })),
    [leidas, descartadas]
  );

  const items_ = useMemo(
    () => conEstado(items.filter((n) => !descartadas.has(n.id))),
    [items, descartadas, conEstado]
  );
  const todas = useMemo(() => conEstado(items), [items, conEstado]);
  const hayDescartadas = useMemo(() => items.some((n) => descartadas.has(n.id)), [items, descartadas]);

  return {
    items: items_,
    todas,
    hayDescartadas,
    noLeidas,
    marcarTodasLeidas,
    descartar,
    restaurarTodas,
    refetch: cargar,
    habilitado: isGeneral,
  };
}
