import { FunctionComponent, useState } from 'react'
import { AddressInput, Button } from '../../atoms'
import { TransactionModal } from '../../molecules/transaction-modal'
import { useSendTransaction } from '@soroban-react/contracts'
import { useSorobanReact } from '@soroban-react/core'
import { randomBytes } from 'crypto'
import {
  useNetwork,
} from '../../../wallet'
import * as SorobanClient from 'soroban-client'
import { contractTransaction } from '../../../shared/sorobanHelpers'
import { IResultSubmit } from '../../../shared/types'
let xdr = SorobanClient.xdr

export interface IFormDeployerProps {
  account: string
  tokenId: string
  deployerId: string
  gameId: string
  networkPassphrase: string
  symbol?: string
}

const FormDeployer: FunctionComponent<IFormDeployerProps> = props => {
  const sorobanContext = useSorobanReact()

  const [opponentAddress, setOpponentAddress] = useState<string>('')

  const [resultSubmit, setResultSubmit] = useState<IResultSubmit | undefined>()
  const [isSubmitting, setSubmitting] = useState(false)
  const { server } = useNetwork()

  const { sendTransaction } = useSendTransaction()

  const closeModal = (): void => {
    setResultSubmit(undefined)
  }

  const clearOpponentAddress = (): void => {
    setOpponentAddress('')
  }

  const handleSubmit = async (): Promise<void> => {
    setSubmitting(true)

    if (!server) throw new Error("Not connected to server")

    try {
      const source = await server.getAccount(props.account)

      // create Game
      const salt = xdr.ScVal.scvBytes(randomBytes(32))
      const wasmHash = xdr.ScVal.scvBytes(Buffer.from(props.gameId, 'hex'))
      const initArgs = xdr.ScVal.scvVec([new SorobanClient.Address(props.account).toScVal(), new SorobanClient.Address(opponentAddress).toScVal()])

      const transaction = contractTransaction(
        props.networkPassphrase,
        source,
        props.deployerId,
        'deploy',
        salt,
        wasmHash,
        initArgs
      );

      let result = await sendTransaction(transaction, { sorobanContext })

      setResultSubmit({
        status: 'success',
        scVal: result,
        value: 1,
        symbol: props.symbol,
      })
      clearOpponentAddress()
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
      <AddressInput
        placeHolder="Opponent Address"
        setAddress={setOpponentAddress}
        input={opponentAddress}
      />
      <Button
        title={'Deploy'}
        onClick={handleSubmit}
        disabled={!opponentAddress || isSubmitting}
        isLoading={isSubmitting}
      />
      {resultSubmit && (
        <TransactionModal result={resultSubmit} closeModal={closeModal} />
      )}
    </div>
  )
}

export { FormDeployer }
