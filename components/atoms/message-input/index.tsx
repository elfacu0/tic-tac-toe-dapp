import React, { Dispatch, SetStateAction } from 'react'
import styles from './style.module.css'

export interface MInputProps {
  placeHolder: string
  setMessage: Dispatch<SetStateAction<string>>
  input: string
}

export function MessageInput({ placeHolder, setMessage, input }: MInputProps) {
  const handleChange = (event: {
    target: { name: string; value: string }
  }): void => {
    const re = new RegExp('^[a-zA-Z0-9_]*$');
    if(!re.test(event.target.value)) return;
    if(event.target.value.length > 32) return;
    setMessage(event.target.value)
  }

  return (
    <input
      name="message"
      type="string"
      placeholder={placeHolder}
      className={styles.input}
      onChange={handleChange}
      value={input}
      autoComplete="on"
    />
  )
}