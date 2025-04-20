<script setup>
import { addCartItem, cart } from "../../utils/store";

const props = defineProps({
    itemId: Number,
});

const addToCart = () => {
    addCartItem(Number(props.itemId));
};
</script>

<template>
    <button class="Product__container__boutons__bouton" @click="addToCart()">
        Ajouter au panier
    </button>
</template>

<style lang="scss" scoped>
button {
    padding: 1rem 0;
    cursor: pointer;
    border: none;
    font-size: 1rem;
    color: #f3f1ed;
    background-color: #b39966;
}
</style>
