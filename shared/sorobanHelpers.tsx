import * as SorobanClient from 'soroban-client'

// Small helper to build a contract invokation transaction
export function contractTransaction(
    networkPassphrase: string,
    source: SorobanClient.Account,
    contractId: string,
    method: string,
    ...params: SorobanClient.xdr.ScVal[]
  ): SorobanClient.Transaction {
    const contract = new SorobanClient.Contract(contractId)
    return new SorobanClient.TransactionBuilder(source, {
      // TODO: Figure out the fee
      fee: '100',
      networkPassphrase,
    })
      .addOperation(contract.call(method, ...params))
      .setTimeout(SorobanClient.TimeoutInfinite)
      .build()
  }
