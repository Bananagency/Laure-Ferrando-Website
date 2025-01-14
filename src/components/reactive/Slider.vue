<template>
<swiper-container space-between="10" free-mode="true" slides-per-view="1.2">
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
</swiper-container>

</template>

<script>
// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
// register Swiper custom elements
register();
</script>

<style scoped>
    swiper-container {
        margin: 2rem 0;
        padding: 0 -2rem;
        width: 100%;
        height: auto;
        }
    swiper-slide {
        width: 20%;
        height: 80vh;
    }
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>