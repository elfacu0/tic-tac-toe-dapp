import React, { Dispatch, SetStateAction } from 'react'
import styles from './style.module.css'

export interface AInputProps {
  placeHolder: string
  setAddress: Dispatch<SetStateAction<string>>
  input: string
}

export function AddressInput({ placeHolder, setAddress, input }: AInputProps) {
  const handleChange = (event: {
    target: { name: string; value: string }
  }): void => {
    setAddress(event.target.value)
  }

  return (
    <input
      name="address"
      type="string"
      placeholder={placeHolder}
      className={styles.input}
      onChange={handleChange}
      value={input}
      autoComplete="on"
    />
  )
}