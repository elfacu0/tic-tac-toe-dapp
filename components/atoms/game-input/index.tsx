import React, { Dispatch, SetStateAction } from 'react'
import styles from './style.module.css'

export interface GInputProps {
  placeHolder: string
  setAddress: Dispatch<SetStateAction<string>>
  input: string
}

export function GameInput({ placeHolder, setAddress, input }: GInputProps) {
  const handleChange = (event: {
    target: { name: string; value: string }
  }): void => {
    setAddress(event.target.value)
  }

  return (
    <input
      name="game-id"
      type="string"
      placeholder={placeHolder}
      className={styles.input}
      onChange={handleChange}
      value={input}
      autoComplete="on"
    />
  )
}