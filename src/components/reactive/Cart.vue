<script lang="js" setup>
import { onMounted, ref } from "vue";
import CartItem from "./CartItem.vue";
import { useStore } from "@nanostores/vue";
import { cart } from "../../utils/store";

const $cart = useStore(cart);
</script>

<template>
    <div class="Cart">
        <div class="Cart__container">
            <h1 class="Cart__container__title">Mon panier</h1>
            <ul v-if="$cart.length > 0" class="Cart__container__list">
                <li
                    v-for="article in $cart"
                    class="Cart__container__list__item"
                >
                    <CartItem :article="article.id" />
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
