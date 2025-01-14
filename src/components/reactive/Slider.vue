<template>
<swiper-container free-mode="true" id="mySwiper">
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
  <swiper-slide><img src="https://picsum.photos/400/500"></swiper-slide>
</swiper-container>

</template>

<script>
import { register } from "swiper/element/bundle";

import { FreeMode } from "swiper/modules";
register();

export default {
  mounted() {
    const swiperEl = document.querySelector("#mySwiper");

    Object.assign(swiperEl, {
      
      breakpoints: {
        0: {
          slidesPerView: 1.2,
          spaceBetween: 10,
        },
        380 : {
          slidesPerView: 1.5,
          spaceBetween: 10,
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 10
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 10
        },
        1296: {
          slidesPerView: 4,
          spaceBetween: 10
        }
      },
    });

    // Initialiser Swiper
    swiperEl.initialize();
  },
};
</script>

<style lang="scss" scoped>
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