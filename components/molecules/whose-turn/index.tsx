import { FunctionComponent, useState } from 'react'
import { Button, Card } from '../../atoms'
import base32 from 'base32.js'
import { useSendTransaction } from '@soroban-react/contracts'
import { SorobanContext, useSorobanReact } from '@soroban-react/core'
import {
  useNetwork,
} from '../../../wallet'
import { IResultSubmit } from '../form-pledge'
import { contractTransaction } from '../../../shared/sorobanHelpers'

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

      let result = await sendTransaction(transaction, { sorobanContext })

      console.log(result.value()?.value().value().toString('hex'));

      // const decoder = new base32.Encoder({ type: "crockford" });

      // const encoded = base32.encode(result.value()?.value().value(),"base32hex")

      // console.log(decoder.write(result.value()?.value().value()).finalize())
      


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
      {/* {resultSubmit && (
        <Card>Is {resultSubmit.scVal.value().value().value().toString("hex") == props.account ? "Your Turn" : "Enemy's Turn"}</Card>
      )} */}
    </div>
  )
}

export { WhoseTurn }
