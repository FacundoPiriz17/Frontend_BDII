import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "../../../lib/cn";

/*
  Lista animada reutilizable
*/

function AnimatedItem({ children, delay = 0, index, selected, onMouseEnter, onClick }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4, once: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      role="option"
      aria-selected={selected}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0 }}
      transition={{ duration: 0.22, delay }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

export default function AnimatedList({
  items = [],
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  initialSelectedIndex = -1,
}) {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topOpacity, setTopOpacity] = useState(0);
  const [bottomOpacity, setBottomOpacity] = useState(1);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, []);

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          onItemSelect?.(items[selectedIndex], selectedIndex);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const el = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) {
      const margin = 50;
      const cTop = container.scrollTop;
      const cHeight = container.clientHeight;
      const iTop = el.offsetTop;
      const iBottom = iTop + el.offsetHeight;
      if (iTop < cTop + margin) container.scrollTo({ top: iTop - margin, behavior: "smooth" });
      else if (iBottom > cTop + cHeight - margin)
        container.scrollTo({ top: iBottom - cHeight + margin, behavior: "smooth" });
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={listRef}
        role="listbox"
        aria-label="Equipos"
        tabIndex={0}
        onScroll={handleScroll}
        className="max-h-[68dvh] space-y-2.5 overflow-y-auto scroll-slim p-1 pr-2 focus:outline-none"
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={item.codigoFifa ?? index}
            index={index}
            delay={Math.min(index, 8) * 0.04}
            selected={selectedIndex === index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              onItemSelect?.(item, index);
            }}
          >
            {renderItem(item, { selected: selectedIndex === index, index })}
          </AnimatedItem>
        ))}
      </div>

      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-surface to-transparent transition-opacity duration-300"
            style={{ opacity: topOpacity }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent transition-opacity duration-300"
            style={{ opacity: bottomOpacity }}
          />
        </>
      )}
    </div>
  );
}
