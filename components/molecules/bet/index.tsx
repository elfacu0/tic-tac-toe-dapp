import { useContractValue, useSendTransaction } from '@soroban-react/contracts'
import { useSorobanReact } from '@soroban-react/core'
import BigNumber from 'bignumber.js'
import { FunctionComponent, useState } from 'react'
import * as SorobanClient from 'soroban-client'
import * as convert from '../../../convert'
import { contractTransaction } from '../../../shared/sorobanHelpers'
import { IResultSubmit } from '../../../shared/types'
import { Utils } from '../../../shared/utils'
import {
  useNetwork,
} from '../../../wallet'
import { AmountInput, Button } from '../../atoms'
import styles from './style.module.css'
import { Constants } from '../../../shared/constants'

let xdr = SorobanClient.xdr

export interface IBetProps {
  account: string
  tokenId: string
  gameId: string
  networkPassphrase: string
  symbol?: string
}

const Bet: FunctionComponent<IBetProps> = props => {
  const sorobanContext = useSorobanReact()
  const [bet, setBet] = useState<number>()
  const [inputBet, setInputBet] = useState<string>('')
  const [resultSubmit, setResultSubmit] = useState<IResultSubmit | undefined>()
  const [isSubmitting, setSubmitting] = useState(false)
  const { server } = useNetwork()  

  const { sendTransaction } = useSendTransaction()  

  const useLoadToken = (): any => {
    return {
      userBalance: useContractValue({
        contractId: Constants.TokenId,
        method: 'balance',
        params: [new SorobanClient.Address(props.account).toScVal()],
        sorobanContext
      }),
      decimals: useContractValue({
        contractId: Constants.TokenId,
        method: 'decimals',
        sorobanContext
      }),
      symbol: useContractValue({
        contractId: Constants.TokenId,
        method: 'symbol',
        sorobanContext
      }),
    }
  }

  let token = useLoadToken()
  
  const userBalance = convert.scvalToBigNumber(token.userBalance.result)
  const tokenDecimals =
    token.decimals.result && (token.decimals.result?.u32() ?? 7)
  const tokenSymbol =
    token.symbol.result && convert.scvalToString(token.symbol.result)?.replace("\u0000", "")

  const handleMakeBet = async (): Promise<void> => {
    setSubmitting(true)

    if (!server) throw new Error("Not connected to server")

    try {
      const source = await server.getAccount(props.account)

      const transaction = contractTransaction(
        props.networkPassphrase,
        source,
        props.gameId,
        'bet',
        new SorobanClient.Address(props.account).toScVal(),
        xdr.ScVal.scvBytes(Buffer.from(props.tokenId, 'hex')),
        convert.bigNumberToI128(BigNumber(bet || 0).shiftedBy(7))
      );

      let result = await sendTransaction(transaction, { sorobanContext });

      setBet(0)
      setInputBet('')
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
      sorobanContext.connect()
    }
  }

  const handleCollectBet = async (): Promise<void> => {
    setSubmitting(true)

    if (!server) throw new Error("Not connected to server")

    try {
      const source = await server.getAccount(props.account)

      console.log(props.account);

      const transaction = contractTransaction(
        props.networkPassphrase,
        source,
        props.gameId,
        'clct_bet',
        new SorobanClient.Address(props.account).toScVal(),
      );

      let result = await sendTransaction(transaction, { sorobanContext });

      console.log(result);
      

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
      sorobanContext.connect()
    }
  }

  return (
    <div className={styles.container}>
      <AmountInput input={inputBet} setInput={setInputBet} setAmount={setBet} placeHolder='Bet' />
      <div className={styles.buttonWrapper}>
        <Button
          title={'Make Bet'}
          onClick={handleMakeBet}
          disabled={!bet || !props.gameId}
          isLoading={isSubmitting}
        />
        <Button
          title={'Collect Bet'}
          onClick={handleCollectBet}
          disabled={!props.gameId}
          isLoading={isSubmitting}
        />
      </div>
      <MintButton
        account={props.account}
        decimals={tokenDecimals}
        symbol={tokenSymbol}
      />
      <div className={styles.wrapper}>
        <div>
          <h6>Your balance:  {Utils.formatAmount(userBalance, tokenDecimals)} {tokenSymbol}</h6>
        </div>
      </div>
    </div>
  )

  // MintButton mints 100.0000000 tokens to the user's wallet for testing
  function MintButton({
    account,
    decimals,
    symbol,
  }: {
    account: string
    decimals: number
    symbol: string
  }) {
    const [isSubmitting, setSubmitting] = useState(false)
    const { activeChain, server } = useNetwork()
    const networkPassphrase = activeChain?.networkPassphrase ?? ''

    const { sendTransaction } = useSendTransaction()
    const amount = BigNumber(100)

    return (
      <Button
        title={`Mint ${amount.toString()} ${symbol}`}
        onClick={async () => {
          setSubmitting(true)
          if (!server) throw new Error("Not connected to server")

          let adminSource, walletSource
          try {
            adminSource = await server.getAccount(Constants.TokenAdmin)
            walletSource = await server.getAccount(account)
          }
          catch (error) {
            alert("Your wallet or the token admin wallet might not be funded")
            setSubmitting(false)
            return
          }

          try {
            console.log("Establishing the trustline...")
            console.log("sorobanContext: ", sorobanContext)
            const trustlineResult = await sendTransaction(
              new SorobanClient.TransactionBuilder(walletSource, {
                networkPassphrase,
                fee: "1000", // arbitrary
              })
                .setTimeout(60)
                .addOperation(
                  SorobanClient.Operation.changeTrust({
                    asset: new SorobanClient.Asset(symbol, Constants.TokenAdmin),
                  })
                )
                .build(), {
              timeout: 60 * 1000, // should be enough time to approve the tx
              skipAddingFootprint: true, // classic = no footprint
              // omit `secretKey` to have Freighter prompt for signing
              // hence, we need to explicit the sorobanContext
              sorobanContext
            },
            )
            console.debug(trustlineResult)
          } catch (err) {
            console.log("Error while establishing the trustline: ", err)
            console.error(err)
          }

          try {
            console.log("Minting the token...")
            const paymentResult = await sendTransaction(
              new SorobanClient.TransactionBuilder(adminSource, {
                networkPassphrase,
                fee: "1000",
              })
                .setTimeout(10)
                .addOperation(
                  SorobanClient.Operation.payment({
                    destination: walletSource.accountId(),
                    asset: new SorobanClient.Asset(symbol, Constants.TokenAdmin),
                    amount: amount.toString(),
                  })
                )
                .build(), {
              timeout: 10 * 10000,
              skipAddingFootprint: true,
              secretKey: Constants.TokenAdminSecretKey,
              sorobanContext
            }
            )
            console.debug(paymentResult)
            sorobanContext.connect()
          } catch (err) {
            console.log("Error while minting the token: ", err)
            console.error(err)
          }
          //
          // TODO: Show some user feedback while we are awaiting, and then based
          // on the result
          //
          setSubmitting(false)

        }}
        disabled={isSubmitting}
        isLoading={isSubmitting}
      />
    )
  }
}


export { Bet }
