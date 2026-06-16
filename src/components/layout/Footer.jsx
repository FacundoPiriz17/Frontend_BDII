export default function Footer() {
  return (
    <footer className="mt-auto bg-navy-950 text-navy-200">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm sm:flex-row sm:px-6">
        <p className="font-bold text-white display-tight">UCU Mundial</p>
        <p className="text-xs">
          © 2026 Universidad Católica del Uruguay · Obligatorio Bases de Datos II
        </p>
        <p className="text-xs text-navy-300">Entradas con QR dinámico · cadena de custodia auditable</p>
      </div>
    </footer>
  );
}
