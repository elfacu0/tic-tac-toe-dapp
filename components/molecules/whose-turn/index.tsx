import { useSendTransaction } from '@soroban-react/contracts'
import { useSorobanReact } from '@soroban-react/core'
import { FunctionComponent, useState } from 'react'
import { Address } from 'soroban-client'
import { contractTransaction } from '../../../shared/sorobanHelpers'
import { IResultSubmit } from '../../../shared/types'
import {
  useNetwork,
} from '../../../wallet'
import { Button } from '../../atoms'

export interface ITurnProps {
  account: string
  tokenId: string
  gameId: string
  networkPassphrase: string
  symbol?: string
}

const WhoseTurn: FunctionComponent<ITurnProps> = props => {
  const sorobanContext = useSorobanReact()

  const [resultSubmit, setResultSubmit] = useState<IResultSubmit | undefined>()
  const [isSubmitting, setSubmitting] = useState(false)
  const [turn, setTurn] = useState<string>('')
  const { server } = useNetwork()

  const { sendTransaction } = useSendTransaction()

  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true)

    if (!server) throw new Error("Not connected to server")

    try {
      const source = await server.getAccount(props.account)

      const transaction = contractTransaction(
        props.networkPassphrase,
        source,
        props.gameId,
        'turn',
      );

      let result = await sendTransaction(transaction, { sorobanContext });

      const addressTurn = Address.fromScAddress(result.address()).toString();

      setTurn(addressTurn)

      setResultSubmit({
        status: 'success',
        scVal: result,
        value: 1,
        symbol: props.symbol,
      })
    } catch (e) {
      if (e instanceof Error) {
        setResultSubmit({
          status: 'error',
          error: e?.message || 'An error has occurred',
        })
      } else {
        throw e;
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Button
        title={'Whose turn?'}
        onClick={handleSubmit}
        disabled={!props.gameId}
        isLoading={isSubmitting}
      />
      {resultSubmit && (
        <span>Is {turn == props.account ? "Your Turn" : { turn } + " Turn"}</span>
      )}
    </div>
  )
}

export { WhoseTurn }
