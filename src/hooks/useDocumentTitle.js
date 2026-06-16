import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · UCU Mundial` : "UCU Mundial";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
