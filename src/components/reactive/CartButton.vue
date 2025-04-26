<script setup>
import { onMounted } from "vue";
import { total, cart, updateTotal } from "../../utils/store";
import { useStore } from "@nanostores/vue";
import cartImage from "../../assets/cart.svg";

const $total = useStore(total);

onMounted(() => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("cart")) {
        const cartState = JSON.parse(localStorage.getItem("cart"));
        cart.set(cartState);
    }
    updateTotal();
});
</script>

<template>
    <a href="/panier">
        <div class="Panier">
            <img class="Panier__image" :src="cartImage.src" alt="" />
            <div v-if="$total > 0" class="Panier__compteur">
                {{ $total }}
            </div>
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
