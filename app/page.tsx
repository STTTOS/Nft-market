import { ethers } from 'ethers'
import { redirect } from 'next/navigation'

import { contract } from '@/web3'
import { NftMeta } from '@/types/Nft'
import NftList from '@/components/NftList'

// force this page to ssr
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getNfts() {
  const nftsInfo = await contract.getAllNftsOnSale()
  const nftsTokenURI = await Promise.all(
    nftsInfo.map(({ tokenId }) => contract.tokenURI(tokenId))
  )

  const nftsMeta: NftMeta[] = await Promise.all(
    nftsTokenURI.map(async (URI) => {
      const res = await fetch(URI, { cache: 'force-cache' })

      try {
        return await res.json()
      } catch (error) {
        redirect('/serverError')
      }
    })
  )

  // 通过tokenId => tokenURI => nftJson => (nftJson + NftInfo)
  return nftsInfo.map(({ price, creator, tokenId }, i) => ({
    creator,
    tokenId: String(tokenId),
    price: ethers.formatEther(price),
    ...nftsMeta[i]
  }))
}
export default async function Home() {
  const nfts = await getNfts()

  return (
    <main className="pt-16 pb-20 px-4">
      <div className="relative">
        <div className="text-center">
          <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
            Amazing Creatures NFTs
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Mint a NFT to get unlimited ownership forever!
          </p>
        </div>

        <NftList list={nfts} />
      </div>
    </main>
  )
}
