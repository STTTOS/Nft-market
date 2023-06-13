const { rejects } = require('assert')
const { ethers } = require('ethers')

const NftMarket = artifacts.require('NftMarket')

contract('NftMarket', (accounts) => {
  let instance = null
  const listingPrice = ethers.parseEther('0.02').toString()
  const nftPrice = ethers.parseEther('1.0').toString()

  before(async () => {
    instance = await NftMarket.deployed()
  })

  describe('Mint Token', () => {
    const tokenURI = 'testURI'

    before(async () => {
      await instance.mintToken(tokenURI, nftPrice, {
        from: accounts[0],
        value: listingPrice
      })
    })

    it('owner should be accounts[0]', async () => {
      const owner = await instance.ownerOf(1)

      assert.strictEqual(owner, accounts[0], 'failed when mint a token')
    })

    it('tokenURI should be "testURI"', async () => {
      const value = await instance.tokenURI(1)

      assert.strictEqual(value, tokenURI, 'tokenURI mismatched')
    })

    it('a tokenURI can not be minted once more', async () => {
      await rejects(
        instance.mintToken(tokenURI, nftPrice, {
          from: accounts[0],
          value: listingPrice
        }),
        'mint a same tokenURI twice!'
      )
    })

    it('nft count should be one', async () => {
      const value = await instance.listedItemsCount()

      assert.strictEqual(value.toNumber(), 1, 'nft count is not one')
    })

    it('verify nft property', async () => {
      const nft = await instance.getNft(1)

      assert.strictEqual(nft.tokenId, '1', 'nft.tokenId is mismatched')
      assert.strictEqual(nft.price, nftPrice, 'nft.price is mismatched')
      assert.strictEqual(nft.creator, accounts[0], 'nft.creator is mismatched')
      assert.strictEqual(nft.isListed, true, 'nft.isListed is mismatched')
    })

    it(`listing price should be ${ethers.formatEther(
      listingPrice
    )} ether`, async () => {
      await rejects(
        instance.mintToken(
          tokenURI,
          nftPrice,
          {
            from: accounts[0],
            value: '250'
          },
          'listing price mismatced'
        )
      )
    })
  })

  describe('Buy Nft', () => {
    before(async () => {
      await instance.buyNft(1, {
        from: accounts[1],
        value: nftPrice
      })
    })

    it('verify the balance of accounts 0 and 1', async () => {
      const balanceOne = await instance.balanceOf(accounts[0])
      const balanceTwo = await instance.balanceOf(accounts[1])

      assert.strictEqual(balanceOne.toNumber(), 0, 'balanceOne mismitched')
      assert.strictEqual(balanceTwo.toNumber(), 1, 'balanceOne mismitched')
    })

    it('listed count should be zero', async () => {
      const listedCount = await instance.listedItemsCount()
      const nft = await instance.getNft(1)

      assert.strictEqual(listedCount.toNumber(), 0, 'listedCount mismatched')
      assert.strictEqual(nft.isListed, false, 'property: isListed mismatched')
    })

    it('owner of the nft should be accounts[1]', async () => {
      const owner = await instance.ownerOf(1)

      assert.strictEqual(owner, accounts[1], 'owner of nft mismatched')
    })
  })

  describe('Query Nft list', () => {
    const tokenURI = 'testURI_2'

    before(async () => {
      await instance.mintToken(tokenURI, nftPrice, {
        from: accounts[1],
        value: listingPrice
      })
    })

    it('get all nfts on sale', async () => {
      const allNfts = await instance.getAllNftsOnSale()

      assert.strictEqual(allNfts.length, 1, 'nfts count mismatched')
      assert.strictEqual(allNfts[0].tokenId, '2', 'nfts[0] tokenId mismatched')
    })

    it('get owned nfts', async () => {
      const nftsOfAccountOne = await instance.getNftsByOwner({
        from: accounts[0]
      })
      const nftsOfAccountTwo = await instance.getNftsByOwner({
        from: accounts[1]
      })

      assert.strictEqual(nftsOfAccountOne.length, 0, 'nfts count mismatched')
      assert.strictEqual(nftsOfAccountTwo.length, 2, 'nfts count mismatched')
    })
  })

  describe('Listing a nft', () => {
    const newListingPrice = ethers.parseEther('0.03').toString()
    const newNftPrice = ethers.parseEther('2.0').toString()

    before(async () => {
      await instance.setListingPrice(newListingPrice, {
        from: accounts[0]
      })

      await instance.placeNftOnSale(1, newNftPrice, {
        from: accounts[1],
        value: newListingPrice
      })
    })

    it('list nft 1', async () => {
      const [{ isListed }] = await instance.getNftsByOwner({
        from: accounts[1]
      })
      assert.strictEqual(isListed, true, 'list nft failed')
    })

    it('should set the new price of nft', async () => {
      const [{ price }] = await instance.getNftsByOwner({
        from: accounts[1]
      })
      assert.strictEqual(price, newNftPrice, 'list nft failed')
    })

    it('only owner can change the listing price', async () => {
      await rejects(
        instance.setListingPrice(
          newListingPrice,
          {
            from: accounts[1]
          },
          'You are not the owner of contract'
        )
      )
    })
  })
})
