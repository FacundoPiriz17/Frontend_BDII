import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { transferenciaService } from "../../transferencias/services/transferenciaService";
import { derivarNotificaciones } from "../services/notificacionService";
import { routePaths } from "../../../routes/routePaths";
import { storage } from "../../../lib/storage";

const claveLeidas = (email) => `notif-leidas:${(email || "").toLowerCase()}`;
const POLL_MS = 60_000;

/**
 * Notificaciones del usuario general.
 * Estado de "leído" persistido en localStorage por usuario. Refresca cada
 * minuto y cuando la pestaña vuelve a foco.
 */
export function useNotificaciones() {
  const { isGeneral, user } = useAuth();
  const email = user?.email;
  const [items, setItems] = useState([]);
  const [leidas, setLeidas] = useState(() => new Set(storage.get(claveLeidas(email)) ?? []));

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

  const noLeidas = useMemo(
    () => items.filter((n) => !leidas.has(n.id)).length,
    [items, leidas]
  );

  const marcarTodasLeidas = useCallback(() => {
    const todas = new Set([...leidas, ...items.map((n) => n.id)]);
    setLeidas(todas);
    storage.set(claveLeidas(email), [...todas]);
  }, [items, leidas, email]);

  const itemsConEstado = useMemo(
    () => items.map((n) => ({ ...n, leida: leidas.has(n.id) })),
    [items, leidas]
  );

  return { items: itemsConEstado, noLeidas, marcarTodasLeidas, refetch: cargar, habilitado: isGeneral };
}
