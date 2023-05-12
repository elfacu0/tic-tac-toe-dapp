import { useSendTransaction } from '@soroban-react/contracts'
import { useSorobanReact } from '@soroban-react/core'
import { FunctionComponent, useState } from 'react'
import * as SorobanClient from 'soroban-client'
import { contractTransaction } from '../../../shared/sorobanHelpers'
import { IResultSubmit } from '../../../shared/types'
import { useNetwork } from '../../../wallet'
import { Button, MessageInput } from '../../atoms'
import styles from './style.module.css'

export interface IChat {
  account: string
  deployerId: string
  gameId: string
  networkPassphrase: string
  symbol?: string
}

const Chat: FunctionComponent<IChat> = ({ account, deployerId, gameId, networkPassphrase }) => {
  const [message, setMessage] = useState<string>('')
  const [chats, setChats] = useState<string[]>()
  const [resultSubmit, setResultSubmit] = useState<IResultSubmit | undefined>()
  const sorobanContext = useSorobanReact()
  const { sendTransaction } = useSendTransaction()
  const { server } = useNetwork()

  const closeModal = (): void => {
    setResultSubmit(undefined)
  }

  const parseRawChat = (rawChat: (SorobanClient.xdr.ScVal[] | [])) => {
    return rawChat.map((msg: SorobanClient.xdr.ScVal) => {
      console.log(msg.map())
      const msgVec: (SorobanClient.xdr.ScMapEntry[] | null) = msg.map();
      if (!msgVec) return '';
      const rawBody: SorobanClient.xdr.ScMapEntry = msgVec[1];
      return rawBody?.val()?.value()?.toString() ?? '';
    })
  }

  const sendMessage = async () => {
    if (!server) throw new Error("Not connected to server")
    if (!message) return;

    try {
      const source = await server.getAccount(account)

      let result = await sendTransaction(
        contractTransaction(
          networkPassphrase,
          source,
          gameId,
          'send_msg',
          new SorobanClient.Address(account).toScVal(),
          SorobanClient.xdr.ScVal.scvSymbol(message)
        ),
        { sorobanContext }
      )

      if (result) {
        setResultSubmit({
          status: 'success',
          scVal: result,
          value: 1,
        })
      }
    } catch (e) {
      if (e instanceof Error) {
        setResultSubmit({
          status: 'error',
          error: e?.message || 'An error has occurred',
        })
      } else {
        throw e;
      }
    }
  }

  const getChats = async () => {
    if (!server) throw new Error("Not connected to server")

    try {
      const source = await server.getAccount(account)

      let result = await sendTransaction(
        contractTransaction(
          networkPassphrase,
          source,
          gameId,
          'chat',
        ),
        { sorobanContext }
      )

      if (result) {
        const rawChat: (SorobanClient.xdr.ScVal[] | null) = result.vec();
        if (rawChat !== null) {
          setChats(parseRawChat(rawChat));
        }

        setResultSubmit({
          status: 'success',
          scVal: result,
          value: 1,
        })
      }
    } catch (e) {
      if (e instanceof Error) {
        setResultSubmit({
          status: 'error',
          error: e?.message || 'An error has occurred',
        })
      } else {
        throw e;
      }
    }
  }

  return (
    <div className={styles.container}>
      <ul className={styles.chats}>
        {chats && chats.map((chat, i) => <li key={i} className={styles.msg}>{chat}</li>)}
      </ul>
      <MessageInput input={message} placeHolder='Message here' setMessage={setMessage} />
      <Button
        title={'Send'}
        onClick={sendMessage}
        disabled={!message || !gameId}
        isLoading={false}
      />
      <Button
        title={'Get Chats'}
        onClick={getChats}
        disabled={!gameId}
        isLoading={false}
      />
    </div>
  )
}

export { Chat }
