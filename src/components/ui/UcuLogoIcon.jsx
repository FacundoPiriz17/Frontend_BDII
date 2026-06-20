import { cn } from "../../lib/cn";
import ucuLogo from "../../assets/logos/ucu-logo-white.png";

export default function UcuLogoIcon({ className, imgClassName, alt = "", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-navy-950 p-1",
        className
      )}
      {...props}
    >
      <img
        src={ucuLogo}
        alt={alt}
        className={cn("h-full w-full object-contain", imgClassName)}
        draggable="false"
      />
    </span>
  );
}
