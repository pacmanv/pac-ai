import type { Ref } from 'react'

interface MenuButtonProps {
  ref?: Ref<HTMLButtonElement>
  isOpen: boolean
  onOpen: () => void
}

/** The ⋯ button in every page header. */
export function MenuButton({ ref, isOpen, onOpen }: MenuButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className="site-menu-btn"
      aria-label="Open menu"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls="site-menu"
      onClick={onOpen}
    >
      <i />
      <i />
      <i />
    </button>
  )
}
