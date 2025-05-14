<script setup>
import { addCartItem, cart } from "../../utils/store";

const props = defineProps({
    id: Number,
    name: String,
    image: String,
    price: Number,
    weight: {
        type: [Number, String],
        required: true
    }
});

const addToCart = () => {
    addCartItem(
        Number(props.id),
        String(props.name),
        String(props.image),
        Number(props.price),
        parseFloat(props.weight)
    );
};
</script>

<template>
    <button class="Bouton" @click="addToCart()">Ajouter au panier</button>
</template>

<style lang="scss" scoped>
.Bouton {
    padding: 1rem 0;
    cursor: pointer;
    border: none;
    font-size: 1rem;
    color: #f3f1ed;
    background-color: #b39966;
}
</style>
