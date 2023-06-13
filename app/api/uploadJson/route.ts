import type { NextRequest } from 'next/server'
import type { NftMeta } from '../../../types/Nft'
import type { PinResponse } from '../uploadImage/route'

import axios from 'axios'
import { v4 } from 'uuid'
import { NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const data: NftMeta = await req.json()

  const config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PINATA_JWT}`
    },
    data: {
      pinataContent: data,
      pinataMetadata: {
        name: `${data.name}_json_${v4()}`
      }
    }
  }

  const res = await axios(config)
  const { IpfsHash } = res.data as PinResponse

  return NextResponse.json({
    URI: `${process.env.PINATA_DOMAIN}${IpfsHash}`
  })
}
