import type { NftMarket } from '@/types'

import { ethers } from 'ethers'

import { abi, networks } from '../build/contracts/NftMarket.json'

const NEXT_PUBLIC_NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID!

const address =
  networks[NEXT_PUBLIC_NETWORK_ID as keyof typeof networks].address!

const provider = (() => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    return new ethers.BrowserProvider(window.ethereum, 'any')
  }
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSONRPC_URL)
})()

function getBrowerProvider() {
  return new ethers.BrowserProvider(window.ethereum, 'any')
}

function getNodeJsProvider() {
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSONRPC_URL)
}

const contract = new ethers.Contract(
  address,
  abi,
  provider
) as unknown as NftMarket

let browerContract: NftMarket
async function getContract() {
  if (browerContract) return browerContract

  const _contract = new ethers.Contract(address, abi, provider)
  const signer = await provider.getSigner()
  browerContract = _contract.connect(signer) as unknown as NftMarket
  return browerContract
}
export { contract, provider, getContract, getBrowerProvider, getNodeJsProvider }
