import { useSendTransaction } from '@soroban-react/contracts'
import { useSorobanReact } from '@soroban-react/core'
import { Dispatch, FunctionComponent, SetStateAction, useState } from 'react'
import * as SorobanClient from 'soroban-client'
import { contractTransaction } from '../../../shared/sorobanHelpers'
import { IResultSubmit } from '../../../shared/types'
import { useNetwork } from '../../../wallet'
import { Button, GameInput } from '../../atoms'
import { SetGameModal } from '../set-game-modal'

export interface ISetGame {
  account: string
  deployerId: string
  gameId: string
  networkPassphrase: string
  symbol?: string
  setGameId: Dispatch<SetStateAction<string>>
}

const SetGame: FunctionComponent<ISetGame> = ({ account, deployerId, gameId, networkPassphrase, setGameId }) => {
  const [id, setId] = useState<string>("")
  const [resultSubmit, setResultSubmit] = useState<IResultSubmit | undefined>()
  const sorobanContext = useSorobanReact()
  const { sendTransaction } = useSendTransaction()
  const { server } = useNetwork()

  const closeModal = (): void => {
    setResultSubmit(undefined)
  }

  const setGame = async (id: string) => {
    if (!server) throw new Error("Not connected to server")

    try {
      if (id == gameId) return;

      const source = await server.getAccount(account)

      let result = await sendTransaction(
        contractTransaction(
          networkPassphrase,
          source,
          deployerId,
          'game',
          SorobanClient.xdr.ScVal.scvBytes(Buffer.from(id, 'hex'))
        ),
        { sorobanContext }
      )

      if (result) {
        setResultSubmit({
          status: 'success',
          scVal: result,
          value: 1,
        })
        setGameId(id)
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
    <div>
      {resultSubmit && <SetGameModal closeModal={closeModal} result={resultSubmit} />}
      <GameInput
        input={id}
        placeHolder='244e3edab410b4c83446721de8f1ab978771877cbfd75cf3bb76875e4a9bd705'
        setAddress={setId}
      />
      <Button
        title={'Set Game'}
        onClick={() => setGame(id)}
        disabled={!id}
        isLoading={false}
      />
    </div>
  )
}

export { SetGame }
