import { FunctionComponent, useState } from 'react'
import { Constants } from '../../../shared/constants'
import {
  useAccount,
  useNetwork,
} from '../../../wallet'
import { Chat, Grid, SetGame, WhoseTurn } from '../../molecules'
import styles from './style.module.css'

const Game: FunctionComponent = () => {
  const [gameId, setGameId] = useState<string>("")
  const { data: account } = useAccount()
  const { activeChain } = useNetwork()

  const networkPassphrase = activeChain?.networkPassphrase ?? ''

  return (
    <div className={styles.content}>
      {account &&
        <div className={styles.row}>
          <div className={styles.column}>
          <Chat
              deployerId={Constants.DeployerId}
              gameId={gameId}
              networkPassphrase={networkPassphrase}
              account={account.address}
            />
          </div>
          <div className={styles.column}>
            <SetGame
              deployerId={Constants.DeployerId}
              gameId={gameId}
              networkPassphrase={networkPassphrase}
              account={account.address}
              setGameId={setGameId}
            />
            <Grid tokenId={Constants.TokenId}
              deployerId={Constants.DeployerId}
              gameId={gameId}
              networkPassphrase={networkPassphrase}
              account={account.address} />
            <WhoseTurn
              tokenId={Constants.TokenId}
              gameId={gameId}
              networkPassphrase={networkPassphrase}
              account={account.address}
            />
          </div>
        </div>
      }
    </div>
  )
}

export { Game }
