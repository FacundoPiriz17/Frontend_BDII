import Modal from "../ui/Modal";
import Button from "../ui/Button";

/**
 * Confirmación para acciones irreversibles (cancelar compra, invalidar
 * entrada, transferir). El botón confirma con el verbo exacto de la acción.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  variant = "primary",
  loading = false,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Volver
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <p className="text-sm text-ink-soft">{description}</p>}
      {children}
    </Modal>
  );
}
