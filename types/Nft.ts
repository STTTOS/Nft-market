type AttributeType = 'health' | 'attack' | 'speed'

interface NftAttribute {
  type: AttributeType
  value: string
}

export interface NftInfo {
  price: string
  tokenId: string
  creator: string
  isListed: boolean
}

export interface NftMeta {
  name: string
  description: string
  image: string
  attributes: NftAttribute[]
}
