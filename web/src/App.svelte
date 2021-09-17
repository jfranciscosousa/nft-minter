<script lang="ts">
  import { NFTStorage } from "nft.storage";
  import { onMount } from "svelte";
  import detectEthereumProvider from "@metamask/detect-provider";
  import { Contract, providers } from "ethers";

  let loadingWeb3Provider = true;
  let currentAccount;
  let TokenContract: Contract;
  let web3Provider;
  let storageClient = new NFTStorage({
    token: import.meta.env.VITE_NFT_STORAGE_KEY as string,
  });
  let name: string;
  let description: string;
  let image: FileList;
  $: {
    if (TokenContract)
      TokenContract.queryFilter(
        TokenContract.filters.Transfer(null, currentAccount)
      ).then(console.log);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const metadata = await storageClient.store({
      name,
      description,
      image: image[0],
    });

    await TokenContract.mint(account, metadata.url);
  }

  onMount(async () => {
    web3Provider = await detectEthereumProvider();
    await window.ethereum.request({ method: "eth_requestAccounts" });
    currentAccount = (
      await window.ethereum.request({ method: "eth_accounts" })
    )[0];
    const provider = new providers.Web3Provider(web3Provider);
    TokenContract = new Contract(
      import.meta.env.VITE_CONTRACT_ADDRESS as string,
      [
        "function mint(address to, string memory ipfsUrl) public payable returns (uint256)",
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
      ],
      provider.getSigner()
    );
    loadingWeb3Provider = false;
  });
</script>

<main>
  <form on:submit={handleSubmit}>
    <input name="name" placeholder="Name" bind:value={name} />
    <input
      name="description"
      placeholder="Description"
      bind:value={description}
    />
    <input name="image" type="file" bind:files={image} />
    <button type="submit">Submit</button>
  </form>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
    width: 16rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
</style>
