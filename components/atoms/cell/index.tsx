import styles from './style.module.css'

export interface CellProps {
  index: number
  state: string
  disabled: boolean
  onClick: (index: number) => void
}

export function Cell({ index, state, disabled, onClick }: CellProps) {  
  return (
    <button className={styles.cell} onClick={() => onClick(index)} disabled={disabled || state != ""}>
      {state}
    </button>
  )
}
