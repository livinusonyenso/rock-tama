"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

const DIALOG_ID = "mobile-nav";

type MobileNavProps = {
  /** Accessible name for the button and the drawer ("Menu"). */
  label: string;
  closeLabel: string;
  /** Pre-rendered on the server so the icon library isn't shipped to the browser. */
  openIcon: ReactNode;
  closeIcon: ReactNode;
  /** Server-rendered drawer contents (MobileNavPanel). */
  children: ReactNode;
};

/**
 * Compact navigation drawer. A native modal <dialog> provides the
 * accessibility behaviour: background inert, focus moved in and contained,
 * Escape closes, top-layer stacking. This component only adds the trigger,
 * aria-expanded sync, focus return, backdrop/link closing, and closing when the
 * viewport reaches the desktop breakpoint. Scroll lock is CSS (globals.css).
 */
export function MobileNav({ label, closeLabel, openIcon, closeIcon, children }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const button = buttonRef.current;
    if (!dialog || !button) return;

    const onClose = () => {
      setOpen(false);
      buttonRef.current?.focus();
    };
    const drawerVisibility = new ResizeObserver(() => {
      if (dialog.open && button.getClientRects().length === 0) dialog.close();
    });

    dialog.addEventListener("close", onClose);
    drawerVisibility.observe(button);
    return () => {
      dialog.removeEventListener("close", onClose);
      drawerVisibility.disconnect();
    };
  }, []);

  const openMenu = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };

  const closeMenu = () => dialogRef.current?.close();

  // A click whose target is the <dialog> itself landed on the backdrop (the panel
  // fills the dialog box); a click on any link means the user chose a destination.
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    const target = event.target as Element;
    if (target === event.currentTarget || target.closest("a[href]")) closeMenu();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={DIALOG_ID}
        onClick={openMenu}
        className="focus-ring -mr-2 flex size-[44px] items-center justify-center text-forest-heading hover:text-gold-700"
      >
        {openIcon}
      </button>

      <dialog
        ref={dialogRef}
        id={DIALOG_ID}
        aria-label={label}
        onClick={onDialogClick}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-5/6 max-w-sm border-0 bg-forest-850 p-0 text-on-dark backdrop:bg-forest-950/60 open:translate-x-0 starting:open:translate-x-full transition-transform duration-200 ease-out motion-reduce:transition-none"
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 pt-4 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-eyebrow font-semibold uppercase tracking-eyebrow text-gold-500">{label}</p>
            <button
              type="button"
              aria-label={closeLabel}
              onClick={closeMenu}
              className="focus-ring-dark -mr-2 flex size-11 items-center justify-center text-on-dark hover:text-gold-500"
            >
              {closeIcon}
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
