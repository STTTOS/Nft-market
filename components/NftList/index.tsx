import type { FC } from 'react'

import Link from 'next/link'

import NftItem from '../NftItem'
import { classNames } from '@/utils'
import { NftMeta, NftInfo } from '@/types/Nft'

interface NftListProps {
  list: (NftMeta & Omit<NftInfo, 'isListed'>)[]
}
const NftList: FC<NftListProps> = ({ list }) => {
  return (
    <div
      className={classNames(
        list.length > 0 ? 'grid' : '',
        'w-4/5 mx-auto mt-4 shadow-2xl p-4 h-min-100 lg:grid-cols-2 xl:grid-cols-3  3xl:grid-cols-4 gap-6'
      )}
    >
      {list.length > 0 ? (
        list.map(({ tokenId, ...rest }) => (
          <NftItem {...rest} tokenId={tokenId} key={tokenId} />
        ))
      ) : (
        <div className="text-gray-500 text-center">
          No Nft...
          <Link href="/create">
            <h3 className="text-2xl tracking-tight font-bold text-gray-500 mt-3 underline">
              Go to Create Nft!
            </h3>
          </Link>
        </div>
      )}
    </div>
  )
}

export default NftList
