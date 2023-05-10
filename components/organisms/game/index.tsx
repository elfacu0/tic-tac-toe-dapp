import styles from './style.module.css'
import {
  useAccount,
  useNetwork,
} from '../../../wallet'
import { Grid } from '../../molecules'
import { Constants } from '../../../shared/constants'
import { FunctionComponent, useState } from 'react'
import { WhoseTurn } from '../../molecules/whose-turn'
import { SetGame } from '../../molecules/set-game'

const Game: FunctionComponent = () => {
  const [gameId, setGameId] = useState<string>("")
  const { data: account } = useAccount()
  const { activeChain } = useNetwork()

  const networkPassphrase = activeChain?.networkPassphrase ?? ''

  return (
    <div className={styles.content}>
      {account &&
        <>
          <SetGame
            gameId={gameId}
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
        </>
      }
    </div>
  )
}

export { Game }
