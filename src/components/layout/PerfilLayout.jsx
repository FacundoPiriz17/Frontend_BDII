import AppLayout from "./AppLayout";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../../features/auth/hooks/useAuth";

/**
 * El perfil es compartido por todos los roles, pero el "chrome" cambia:
 * - Usuario general: navbar superior (AppLayout).
 * - Admin / funcionario: sidebar + topbar del panel (DashboardLayout), para que
 *   no vean el navbar del usuario general. Ambos layouts renderizan <Outlet/>,
 *   así que PerfilPage se monta dentro del layout que corresponda.
 */
export default function PerfilLayout() {
  const { isGeneral, isAdmin, isFuncionario } = useAuth();
  const usarPanel = (isAdmin || isFuncionario) && !isGeneral;
  return usarPanel ? <DashboardLayout /> : <AppLayout />;
}
