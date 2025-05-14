<script lang="js" setup>
import { removeCartItem } from "../../utils/store";
import Sample from "../../assets/image-sample.webp";
import { ref, onMounted } from "vue";

const props = defineProps({
    article: Number,
    title: {
        type: String,
        default: "Titre de l'article",
    },
    price: {
        type: Number,
        default: 100,
    },
    image: {
        type: String,
        default: Sample,
    },
    quantity: Number,
    weight: Number,
});

onMounted(() => {
    console.log('📦 CartItem - Poids reçu:', props.weight, 'kg');
    console.log('📦 CartItem - Type du poids:', typeof props.weight);
});

const emit = defineEmits(['update-quantity']);
const localQuantity = ref(props.quantity);

const removeFromCart = () => {
    removeCartItem(Number(props.article));
};

const updateQuantity = () => {
    if (localQuantity.value !== props.quantity) {
        emit('update-quantity', props.article, localQuantity.value);
    }
};
</script>

<template>
    <div class="Article">
        <div class="Article__container">
            <img class="Article__container__image" :src="image" alt="" />
            <div class="Article__container__infos">
                <h3 class="Article__container__infos__title">{{ title }}</h3>
                <span class="Article__container__infos__price"
                    >{{ price }} €</span
                >
                <br />
                <a
                    class="Article__container__infos__remove"
                    @click="removeFromCart()"
                    >Supprimer</a
                >
            </div>
        </div>
        <div class="Article__board">
            <div class="Article__board__quantity">
                <label for="quantity">Quantité</label>
                <br />
                <input 
                    name="quantity" 
                    type="number" 
                    v-model="localQuantity"
                    min="0"
                    @change="updateQuantity"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.Article {
    border-bottom: 1px solid black;
    padding: 1rem;
    display: flex;
    justify-content: space-between;

    &__container {
        display: flex;
        gap: 1rem;
        &__image {
            max-width: 96px;
            height: 96px;
            object-fit: contain;
            background: #fafafa;
        }
        &__infos {
            &__remove {
                display: inline-block;
                margin-top: 2rem;
                cursor: pointer;
                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
    &__board {
        &__quantity {
            width: 96px;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            input[type="number"] {
                padding: 0.5rem;
            }
            &__update {
                margin-top: 0.5rem;
                padding: 0.5rem;
                background-color: #b39966;
                color: #f3f1ed;
                border: none;
                cursor: pointer;
                font-size: 0.8rem;
                transition: opacity 0.3s ease;

                &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                &:not(:disabled):hover {
                    opacity: 0.9;
                }
            }
        }
    }
}
</style>
