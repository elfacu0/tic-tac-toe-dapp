import { useEffect, useState } from 'react'
import { useIsMounted, useNetwork } from '../../../wallet'
import { Cell, Loading } from '../../atoms'
import styles from './style.module.css'
import { useSendTransaction } from '@soroban-react/contracts'
import { useSorobanReact } from '@soroban-react/core'
import * as SorobanClient from 'soroban-client'
import { contractTransaction } from '../../../shared/sorobanHelpers'


export interface IGridProps {
  account: string
  tokenId: string
  deployerId: string
  gameId: string
  networkPassphrase: string
  symbol?: string
}

export function Grid(props: IGridProps) {
  const mounted = useIsMounted()
  const sorobanContext = useSorobanReact()
  const { sendTransaction } = useSendTransaction()
  const [grid, setGrid] = useState<string[]>(["","","","","","","","",""])
  const [resultSubmit, setResultSubmit] = useState<IResultSubmit | undefined>()
  const [fetching, setFetching] = useState<Boolean>(false)
  const { server } = useNetwork()


  const parseGrid = (rawGrid: SorobanClient.xdr.ScVal[])=>{
    return rawGrid.map((e:SorobanClient.xdr.ScVal ,i: number)=> e.value().toString("utf-8"))
  }

  const getGrid = async () => {
    if (!server) throw new Error("Not connected to server")

    try {
      const source = await server.getAccount(props.account)

      setFetching(true);

      let result = await sendTransaction(
        contractTransaction(
          props.networkPassphrase,
          source,
          props.gameId,
          'grid'
        ),
        { sorobanContext }
      )

      if (result) {
        setGrid(parseGrid(result.value()));

        setResultSubmit({
          status: 'success',
          scVal: result,
          value: 1,
          symbol: props.symbol,
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
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    getGrid();
  }, [props.gameId])


  const markCell = async(index: number)=>{
    if (!server) throw new Error("Not connected to server")

    try {
      const source = await server.getAccount(props.account)
      const posX = Math.abs((index % 3)-2);
      const posY = Math.abs((~~(index / 3))-2);       

      let result = await sendTransaction(
        contractTransaction(
          props.networkPassphrase,
          source,
          props.gameId,
          'play',
          new SorobanClient.Address(props.account).toScVal(),
          SorobanClient.xdr.ScVal.scvU32(posX),
          SorobanClient.xdr.ScVal.scvU32(posY)
        ),
        { sorobanContext }
      )

      if (result) {
        setGrid(parseGrid(result.value()));

        setResultSubmit({
          status: 'success',
          scVal: result,
          value: 1,
          symbol: props.symbol,
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
    } finally {
      setFetching(false)
    }
  }

  return (
    <>
      {mounted && (
        <div className={styles.grid}>
          {fetching && <Loading size={10}/>}
          {
            grid.map((val,i)=><Cell key={i} index={i} state={val} disabled={!props.gameId} onClick={markCell}/>)
          }
        </div>
      )}
    </>
  )
}
