<script lang="ts">
  import { NFTStorage } from "nft.storage";
  import { onMount } from "svelte";
  import TokenContract, {
    buildTokenContract,
  } from "./blockchain/tokenContract";
  import initializeBlockchain from "./blockchain/initializeBlockchain";

  let TokenContract: TokenContract;
  let storageClient = new NFTStorage({
    token: import.meta.env.VITE_NFT_STORAGE_KEY as string,
  });
  let name: string;
  let description: string;
  let image: FileList;
  let alt: string;

  async function handleSubmit(event) {
    event.preventDefault();

    const metadata = await storageClient.store({
      name,
      description,
      image: image[0],
      alt,
    });

    await TokenContract.mint(metadata.url);
  }

  function ipfsToHttp(ipfsUrl: string) {
    const [_1, _2, ...rest] = ipfsUrl.split("/");

    return `https://ipfs.io/ipfs/${rest.join("/")}`;
  }

  onMount(async () => {
    const { provider, currentAccount } = await initializeBlockchain();

    TokenContract = buildTokenContract(provider, currentAccount);
  });
</script>

{#if !TokenContract}
  <p>I am loading</p>
{:else}
  <main>
    <form class="flex-col" style="width: 100%;" on:submit={handleSubmit}>
      <input name="name" placeholder="Name" bind:value={name} />
      <input
        name="description"
        placeholder="Description"
        bind:value={description}
      />
      <input name="image" type="file" bind:files={image} />
      <button type="submit">Submit</button>
      <input name="alt" bind:value={alt} />
    </form>

    <div class="flex-col">
      {#await TokenContract.tokensOfOwner() then tokens}
        {#each tokens as tokenId}
          {#await TokenContract.tokenURI(tokenId) then url}
            <a href={url}>My tokenId: {tokenId}</a>

            <button on:click={() => TokenContract.burn(tokenId)} type="button"
              >BURN TOKEN</button
            >

            {#await fetch(ipfsToHttp(url)) then response}
              {#await response.json() then metadata}
                <img src={ipfsToHttp(metadata.image)} alt={metadata.alt} />
              {/await}
            {/await}
          {/await}
        {/each}
      {/await}
    </div>
  </main>{/if}

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  .flex-col {
    display: flex;
    flex-direction: column;
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
