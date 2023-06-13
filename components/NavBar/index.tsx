'use client'

import useSWR from 'swr'

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { provider, getBrowerProvider } from '@/web3'
import { mapChainIdToNetwork } from '../../constants'

const NavBar = () => {
  const pathname = usePathname()
  const { data: address } = useSWR('web3/accounts', async () => {
    const [account] = await provider.listAccounts()
    return account.address
  })
  const { data: network } = useSWR('web3/network', async () => {
    const network = await getBrowerProvider().getNetwork()

    const networkName =
      mapChainIdToNetwork[String(network.chainId)] || 'unknown'
    return networkName
  })

  async function connectWallet() {
    await getBrowerProvider().send('eth_requestAccounts', [])
  }
  function reloadPage() {
    window.location.reload()
  }
  useEffect(() => {
    const { ethereum } = window

    ethereum.on('chainChanged', reloadPage)
    ethereum.on('accountsChanged', reloadPage)

    return () => {
      ethereum.removeListener('chainChanged', reloadPage)
      ethereum.removeListener('accountsChanged', reloadPage)
    }
  }, [])
  return (
    <div className="h-16 py-4 px-8 flex items-center bg-purple-400 sticky top-0 z-10">
      <img
        src="/page_logo.png"
        alt="logo"
        className="h-full bg-gray-200 w-24 object-contain"
      />
      <nav className="text-white ml-2 space-x-2 w-full">
        <Link
          href="/"
          className={
            pathname === '/'
              ? 'hover:text-gray-300 bg-purple-500 rounded-lg p-1'
              : 'hover:text-gray-300 rounded-lg p-1'
          }
        >
          Market
        </Link>
        <Link
          href="/create"
          className={
            pathname === '/create'
              ? 'hover:text-gray-300 bg-purple-500 rounded-lg p-1'
              : 'hover:text-gray-300 rounded-lg p-1'
          }
        >
          Create
        </Link>
      </nav>
      <div className="flex-shrink-0 mr-2 text-slate-500">{network}</div>
      {address && window.ethereum ? (
        <div className="flex items-center space-x-2 h-full relative group">
          <div className="h-8 w-8 overflow-hidden rounded-full flex-shrink-0 cursor-pointer">
            <img src="/default_avatar.png" alt="avatar" />
          </div>

          <div className="absolute top-8 right-0 shadow-md p-4 rounded-md w-52 z-10 hidden bg-white group-hover:block">
            <div className="truncate text-gray-300">{address}</div>
            <Link href="/profile" className="underline">
              Profile
            </Link>
          </div>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-purple-600 py-1 px-2 text-sm text-slate-300 flex-shrink-0 rounded-md"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}

export default NavBar
