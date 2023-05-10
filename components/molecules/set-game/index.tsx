import { Dispatch, SetStateAction, FunctionComponent, useState } from 'react'
import { GameInput, Button } from '../../atoms'

export interface ISetGame {
  gameId: string
  setGameId: Dispatch<SetStateAction<string>>
}

const SetGame: FunctionComponent<ISetGame> = props => {
  const [gameId, setGameId] = useState<string>('');

  return (
    <div>
      <GameInput
        input={gameId}
        placeHolder='244e3edab410b4c83446721de8f1ab978771877cbfd75cf3bb76875e4a9bd705'
        setAddress={setGameId}
      />
      <Button
        title={'Set Game'}
        onClick={() => props.setGameId(gameId)}
        disabled={!gameId}
        isLoading={false}
      />
    </div>
  )
}

export { SetGame }
