import type { NextPage } from 'next'
import Head from 'next/head'
import { WalletData } from '../components/molecules'
import { Game } from '../components/organisms'
import { Deployer } from '../components/organisms/deployer'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          TicTacToe - Play the game using stellar smart contracts.
        </title>
        <meta
          name="description"
          content="Play TicTactoe with soroban smart contract"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <h3>TicTacToe</h3>
        <WalletData />
      </header>
      <main className={styles.main}>
        <div className={styles.content}>
          <Game />
          <Deployer />
        </div>
      </main>
    </>
  )
}

export default Home
