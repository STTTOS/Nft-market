'use client'

/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next'
import type { NftMeta } from '@/types/Nft'

import useSWR from 'swr'
import Head from 'next/head'
import Link from 'next/link'
import { ethers } from 'ethers'
import Router from 'next/router'
import { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'

import { NftMarket } from '@/types'
import { classNames } from '@/utils'
import { provider, getContract } from '@/web3'
import { listingPrice } from '../../constants'

interface NftProps {
  nftInfo: NftMarket.NftStructOutput
  meta: NftMeta
}
const MyProfile: NextPage = () => {
  const [activeNft, setActiveNft] = useState<NftProps>()

  const { data: nfts = [] } = useSWR('web3/profile', async () => {
    const contract = await getContract()

    const [{ address }] = await provider.listAccounts()
    const ownedNfts = await contract.getNftsByOwner({ from: address })
    const ownedNftsURI = await Promise.all(
      ownedNfts.map(({ tokenId }) => contract.tokenURI(tokenId))
    )
    const ownedNftsMeta: NftMeta[] = await Promise.all(
      ownedNftsURI.map(async (URI) => (await fetch(URI)).json())
    )

    return ownedNfts.map((nftInfo, i) => ({
      nftInfo,
      meta: ownedNftsMeta[i]
    }))
  })

  async function listNft(tokenId: string) {
    const contract = await getContract()
    const [{ address }] = await provider.listAccounts()

    try {
      await toast.promise(
        async () => {
          const tx = await contract.placeNftOnSale(
            tokenId,
            ethers.parseEther(listingPrice),
            {
              from: address,
              value: ethers.parseEther(listingPrice)
            }
          )
          await tx.wait()
        },
        {
          success: 'list nft success',
          error: 'list nft failed',
          pending: 'listing'
        }
      )
      Router.reload()
    } catch {
      // nothing to do
    }
  }

  useEffect(() => {
    if (nfts.length > 0) {
      setActiveNft(nfts[0])
    }
  }, [nfts])

  return (
    <div>
      <Head>
        <title>My Profile</title>
      </Head>
      <ToastContainer />
      <div className="h-full flex">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-stretch overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="flex-1 text-2xl font-bold text-gray-900">
                  Your NFTs
                </h1>

                <section
                  className="mt-8 pb-16"
                  aria-labelledby="gallery-heading"
                >
                  {nfts.length > 0 ? (
                    <ul
                      role="list"
                      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
                    >
                      {nfts.map(({ nftInfo, meta }) => {
                        return (
                          <li
                            key={String(nftInfo.tokenId)}
                            onClick={() => setActiveNft({ nftInfo, meta })}
                            className="relative"
                          >
                            <div
                              className={classNames(
                                nftInfo.tokenId === activeNft?.nftInfo.tokenId
                                  ? 'ring-2 ring-offset-2 ring-indigo-500'
                                  : 'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500',
                                'group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden'
                              )}
                            >
                              <img
                                src={meta.image}
                                alt=""
                                className={classNames(
                                  nftInfo.tokenId === activeNft?.nftInfo.tokenId
                                    ? ''
                                    : 'group-hover:opacity-75',
                                  'object-cover pointer-events-none'
                                )}
                              />
                              <button
                                type="button"
                                className="absolute inset-0 focus:outline-none"
                              >
                                <span className="sr-only">
                                  View details for {meta.name}
                                </span>
                              </button>
                            </div>
                            <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
                              {meta.name}
                            </p>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-300">You have no nfts yet...</p>
                      <Link
                        href="/"
                        className="block mt-2 underline text-2xl text-gray-700"
                      >
                        Go to Market to but one!
                      </Link>
                    </div>
                  )}
                </section>
              </div>
            </main>

            {/* Details sidebar */}
            <aside className="hidden w-96 bg-white p-8 border-l border-gray-200 overflow-y-auto lg:block">
              {activeNft && (
                <div className="pb-16 space-y-6">
                  <div>
                    <div className="block w-full aspect-w-10 aspect-h-7 rounded-lg overflow-hidden">
                      <img
                        src={activeNft.meta.image}
                        alt="nft"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-4 flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">
                          <span className="sr-only">Details for </span>
                          {activeNft.meta.name}
                        </h2>
                        <p className="text-sm font-medium text-gray-500">
                          {activeNft.meta.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Information</h3>
                    <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                      {activeNft.meta.attributes.map(({ type, value }: any) => (
                        <div
                          key={type}
                          className="py-3 flex justify-between text-sm font-medium"
                        >
                          <dt className="text-gray-500">{type}: </dt>
                          <dd className="text-gray-900 text-right">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="flex">
                    <button
                      type="button"
                      className="flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Download Image
                    </button>
                    <button
                      disabled={activeNft.nftInfo.isListed}
                      onClick={() => {
                        listNft(String(activeNft.nftInfo.tokenId))
                      }}
                      type="button"
                      className="disabled:text-gray-400 disabled:cursor-not-allowed flex-1 ml-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {activeNft.nftInfo.isListed ? 'Listed' : 'List Nft'}
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile
