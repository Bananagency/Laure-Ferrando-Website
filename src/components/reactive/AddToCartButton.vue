<script setup>
import { ref } from 'vue';
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

const showFeedback = ref(false);
const feedbackText = ref('');

const addToCart = () => {
    addCartItem(
        Number(props.id),
        String(props.name),
        String(props.image),
        Number(props.price),
        parseFloat(props.weight)
    );
    feedbackText.value = 'Ajouté au panier ✔';
    showFeedback.value = true;
    setTimeout(() => {
        showFeedback.value = false;
    }, 2000);
};
</script>

<template>
    <div class="AddToCart">
        <button class="Bouton" @click="addToCart()">Ajouter au panier</button>
        <p v-if="showFeedback" class="Feedback">{{ feedbackText }}</p>
    </div>
    
</template>

<style lang="scss" scoped>
.AddToCart {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.Bouton {
    padding: 1rem 2rem;
    cursor: pointer;
    border: none;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, var(--accent-color) 0%, #007bff 100%);
    border-radius: 8px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    width: 100%;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
        transform: translateY(0);
    }
}

.Feedback {
    font-size: 0.95rem;
    color: #198754; /* green */
    font-weight: 600;
}
</style>
