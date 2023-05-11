import { useSendTransaction } from '@soroban-react/contracts'
import { useSorobanReact } from '@soroban-react/core'
import { useEffect, useState } from 'react'
import * as SorobanClient from 'soroban-client'
import { contractTransaction } from '../../../shared/sorobanHelpers'
import { IResultSubmit } from '../../../shared/types'
import { useIsMounted, useNetwork } from '../../../wallet'
import { Button, Cell, Loading } from '../../atoms'
import styles from './style.module.css'

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
  const [grid, setGrid] = useState<string[]>(["", "", "", "", "", "", "", "", ""])
  const [resultSubmit, setResultSubmit] = useState<IResultSubmit | undefined>()
  const [fetching, setFetching] = useState<boolean>(false)
  const { server } = useNetwork()


  const parseGrid = (rawGrid: (SorobanClient.xdr.ScVal[] | [])) => {
    return rawGrid.map((e: SorobanClient.xdr.ScVal, i: number) => {
      const cell = e.value();
      if(!cell) return "";
      return cell.toString()
    })
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
        const rawGrid: (SorobanClient.xdr.ScVal[] | null) = result.vec();
        if(rawGrid !== null){
          setGrid(parseGrid(rawGrid));
        }

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


  const markCell = async (index: number) => {
    if (!server) throw new Error("Not connected to server")

    try {
      const source = await server.getAccount(props.account)
      const posX = Math.abs((index % 3) - 2);
      const posY = Math.abs((~~(index / 3)) - 2);

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
        const rawGrid: (SorobanClient.xdr.ScVal[] | null) = result.vec();
        if(rawGrid !== null){
          setGrid(parseGrid(rawGrid));
        }
        
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
        <>
          <div className={styles.grid}>
            {fetching && (<div className={styles.loadContainer}><Loading size={100} /></div>)}
            {
              grid.map((val, i) => <Cell key={i} index={i} state={val} disabled={!props.gameId || fetching} onClick={markCell} />)
            }
          </div>
          <Button disabled={!props.gameId} isLoading={false} onClick={getGrid} title='Reload Grid' />
        </>
      )}
    </>
  )
}
