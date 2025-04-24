<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
    images: {
        type: Array,
        default: null,
    },
});

let current = ref(0);

const imageContainer = ref(null);
const zoomContainer = ref(null);

onMounted(() => {
    if (props.images !== null) {
        const container = imageContainer.value;
        const zoomCont = zoomContainer.value;
        const originalImage = container.querySelector(
            ".Carrousel__main__image",
        );
        const zoomedImage = zoomCont.querySelector(
            ".Carrousel__main__zoom__image",
        );

        container.addEventListener("mouseenter", () => {
            zoomCont.style.display = "block";
        });

        container.addEventListener("mousemove", (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculer la position de l'image zoomée
            const offsetX = (x / originalImage.offsetWidth) * 100;
            const offsetY = (y / originalImage.offsetHeight) * 100;

            zoomedImage.style.transform = `translate(-${offsetX}%, -${offsetY}%)`;
        });

        container.addEventListener("mouseleave", () => {
            zoomCont.style.display = "none";
        });
    }
});
</script>

<template>
    <div v-if="images && images.length > 0" class="Carrousel">
        <div class="Carrousel__main" ref="imageContainer">
            <img
                class="Carrousel__main__image"
                :src="images[current].src"
                :alt="images[current].alt"
            />
            <div class="Carrousel__main__zoom" ref="zoomContainer">
                <img
                    class="Carrousel__main__zoom__image"
                    :src="images[current].src"
                    :alt="images[current].alt"
                />
            </div>
        </div>
        <ul class="Carrousel__list">
            <li
                v-for="(image, index) in images"
                :key="index"
                @click="current = index"
                class="Carrousel__list__item"
                :class="{ active: current === index }"
            >
                <img :src="image.src" :alt="image.alt" />
            </li>
        </ul>
    </div>
    <div v-else class="Carrousel">
        <div class="Carrousel__sample">
            <img
                class="Carrousel__sample__image"
                src="/image-sample.webp"
                alt=""
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.Carrousel {
    width: 100%;
    &__sample {
        width: 548px;
        height: 496px;
        object-fit: contain;
        &__image {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }
    &__main {
        width: 548px;
        height: 496px;
        position: relative;
        display: inline-block;
        overflow: hidden;
        object-fit: contain;
        cursor: zoom-in;
        &__image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            &:hover {
                opacity: 0;
            }
        }
        &__zoom {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            pointer-events: none;
            &__image {
                position: absolute;
                width: 200%;
                height: 200%;
                transform-origin: top left;
                object-fit: contain;
            }
        }
    }
    &__list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        &__item {
            cursor: pointer;
            &.active {
                img {
                    opacity: 1;
                }
            }
            img {
                width: 72px;
                height: 72px;
                object-fit: cover;
                opacity: 0.5;
                transition: 0.2s all ease-in-out;
                &:hover {
                    opacity: 1;
                }
            }
        }
    }
    @media screen and (max-width: 992px) {
        padding: 0 1rem;
        &__main {
            width: 100%;
            height: 348px;
        }
    }
    @media (pointer: coarse) {
        &__main {
            &__image {
                opacity: 1 !important;
            }
            &__zoom {
                display: none !important;
            }
        }
    }
}
</style>
