import { FunctionComponent } from 'react'
import { Card, ConnectButton, Loading } from '../../atoms'
import { Spacer } from '../../atoms/spacer'
import {
  useAccount,
  useNetwork,
} from '../../../wallet'
import { useContractValue } from '@soroban-react/contracts'
import * as SorobanClient from 'soroban-client'
import { FormDeployer } from '../../molecules'
import { Constants } from '../../../shared/constants'
import { useSorobanReact } from '@soroban-react/core'
let xdr = SorobanClient.xdr

const Deployer: FunctionComponent = () => {
  const { data: account } = useAccount()
  const { activeChain } = useNetwork()

  const networkPassphrase = activeChain?.networkPassphrase ?? ''

  const sorobanContext = useSorobanReact()
  // Call the contract rpcs to fetch values
  const useLoadToken = (): any => {
    return {
      name: useContractValue({
        contractId: Constants.TokenId,
        method: 'name',
        sorobanContext
      }),
    }
  }

  let token = useLoadToken()

  const isLoading = (): boolean | undefined => {
    return (
      token.name.loading
    )
  }

  return (
    <Card>
      {isLoading() ? (
        <Loading size={64} />
      ) : (
        <>
          <h6>Deploy new game</h6>
          <Spacer rem={1.5} />
          {(account ? (
              <FormDeployer
                tokenId={Constants.TokenId}
                deployerId={Constants.DeployerId}
                gameId={Constants.GameId}
                networkPassphrase={networkPassphrase}
                account={account.address}
              />
            ) : (
              <ConnectButton label="Connect wallet to pledge" isHigher={true} />
            ))}
         </>
      )}
    </Card>
  )
}

export { Deployer }
