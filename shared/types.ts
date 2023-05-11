import * as SorobanClient from 'soroban-client'

export interface IResultSubmit {
    status: string
    scVal?: SorobanClient.xdr.ScVal
    error?: string
    value?: number
    symbol?: string
}