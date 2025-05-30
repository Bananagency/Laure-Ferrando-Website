<script setup>
import { onMounted, ref } from "vue";
import { totalItems, cart } from "../../utils/store";
import { useStore } from "@nanostores/vue";
import cartImage from "../../assets/cart.svg";

const isClient = ref(false);
const $totalItems = useStore(totalItems);

onMounted(() => {
    isClient.value = true;
    if (typeof localStorage !== "undefined" && localStorage.getItem("cart")) {
        const cartState = JSON.parse(localStorage.getItem("cart"));
        cart.set(cartState);
    }
});
</script>

<template>
    <a href="/panier">
        <div v-if="isClient" class="Panier">
            <img class="Panier__image" :src="cartImage.src" alt="" />
            <div v-if="$totalItems > 0" class="Panier__compteur">
                {{ $totalItems }}
            </div>
        </div>
        <div v-else class="Panier">
            <img class="Panier__image" :src="cartImage.src" alt="" />
        </div>
    </a>
</template>

<style lang="scss" scoped>
.Panier {
    position: relative;
    &__compteur {
        position: absolute;
        color: white;
        background: red;
        padding: 0.5rem;
        border-radius: 3rem;
        font-size: 0.8rem;
        top: -16px;
        right: -8px;
    }
}
</style>
