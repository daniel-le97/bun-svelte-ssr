  <script lang="ts">
    import Counter from '../components/counter.svelte'
    // const style = tw('flex justify-center bg-black')
    // console.log(style);
    
  </script>
  
  <main>
    <div class=" space-x-4">
      <a href="/md">mdsvex</a>
      <a href="/test">test</a>
    </div>
    <div class='flex justify-center'>
      <a href="https://bun.sh" target="_blank" rel="noreferrer"> 
        <img src="./bunlogo.svg" class="logo" alt="Vite Logo" />
      </a>
      <a href="https://svelte.dev" target="_blank" rel="noreferrer"> 
        <img src='./svelte.svg' class="logo svelte" alt="Svelte Logo" />
      </a>
    </div>


    <h1 class="">homepage</h1>
    make changes to pages/index.svelte to see your page update in real-time!
    <div class="card">
      <Counter />
    </div>
    <p class="read-the-docs">
      Click on the Bun and Svelte logos to learn more
    </p>
  </main>
  
  <style>
    .logo {
      height: 6em;
      padding: 1.5em;
      will-change: filter;
    }

    .logo:hover {
      filter: drop-shadow(0 0 2em #646cffaa);
    }

    .logo.svelte:hover {
      filter: drop-shadow(0 0 2em #ff3e00aa);
    }
    .read-the-docs {
      color: #888;
    }
  </style>