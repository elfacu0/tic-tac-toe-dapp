import React from 'react'
import styles from './style.module.css'
import Image from 'next/image'
import {
  CongratulationsSvg,
  ErrorSvg,
  FacebookSvg,
  LinkedinSvg,
  LinkSvg,
  TwitterSvg,
} from '../../../assets/icons'
import { IResultSubmit } from '../../../shared/types'

export interface TransactionModalProps {
  result: IResultSubmit
  closeModal: () => void
}

export function TransactionModal({
  result,
  closeModal,
}: TransactionModalProps) {
  const isSuccess = result.status == 'success'

  return (
    <div>
      <div className={styles.darkBG} onClick={closeModal} />
      <div className={styles.centered}>
        <div className={styles.modal}>
          <Image
            src={isSuccess ? CongratulationsSvg : ErrorSvg}
            width={64}
            height={64}
            alt="avatar"
          />
          <h6>{isSuccess ? 'SUCCESSFULLY DEPLOYED' : 'ERROR'}</h6>
          <span className={styles.message}>
            {(isSuccess && result && result.scVal)
              ? 'HERE IS YOUR GAME ID!!'
              : result.error}
          </span>
          <span className={styles.message}>
            {(isSuccess && result && result.scVal) && `${result.scVal.bytes().toString('hex')}`}
          </span>
          {isSuccess && (
            <div className={styles.socialButtons}>
              <Image
                src={FacebookSvg}
                width={24}
                height={24}
                alt="Share on Facebook"
              />
              <Image
                src={TwitterSvg}
                width={24}
                height={24}
                alt="Share on Twitter"
              />
              <Image
                src={LinkedinSvg}
                width={24}
                height={24}
                alt="Share on LinkedIn"
              />
              <Image src={LinkSvg} width={24} height={24} alt="Copy link" />
            </div>
          )}
          <button className={styles.button} onClick={closeModal}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
