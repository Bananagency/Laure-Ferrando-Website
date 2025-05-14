<script lang="js" setup>
import CartItem from "./CartItem.vue";
import { useStore } from "@nanostores/vue";
import { cart, updateCartItemQuantity } from "../../utils/store";
import { computed, onMounted, ref, watch } from "vue";

const subTotal = ref(0);
const shipping = ref(0);
const total = computed(() => subTotal.value + shipping.value);

const isLoading = ref(true);

const $cart = ref(useStore(cart));

const handleQuantityUpdate = async (articleId, newQuantity) => {
    try {
        isLoading.value = true;
        updateCartItemQuantity(articleId, newQuantity);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la quantité:', error);
    } finally {
        isLoading.value = false;
    }
};

const cost = () => {
    if ($cart.value.length > 0) {
        let e = 0;
        $cart.value.forEach((item) => {
            e += item.quantity * item.price;
        });
        subTotal.value = e;
    }
};

watch(
    $cart,
    (newCart) => {
        if (newCart && newCart.length > 0) {
            console.log("Panier mis à jour :", newCart);
            newCart.forEach(item => {
                console.log(`📦 Cart - Article "${item.name}" - Poids:`, item.weight, 'kg');
                console.log(`📦 Cart - Type du poids:`, typeof item.weight);
            });
            cost();
            isLoading.value = false;
        } else {
            isLoading.value = false;
        }
    },
    { immediate: true, deep: true },
);

onMounted(() => {
    if ($cart.value.length === 0) {
        isLoading.value = false;
    } else {
        cost();
        isLoading.value = false;
    }
});
</script>

<template>
    <div class="cart">
        <div class="cart__wrapper">
            <template v-if="$cart && $cart.length > 0">
                <div class="cart__header">
                    <h1>Mon panier</h1>
                </div>
                
                <div class="cart__main">
                    <div class="cart__items">
                        <ul>
                            <li v-for="article in $cart" :key="article.id">
                                <CartItem
                                    :article="article.id"
                                    :title="article.name"
                                    :image="article.image"
                                    :price="article.price"
                                    :quantity="article.quantity"
                                    :weight="parseFloat(article.weight)"
                                    @update-quantity="handleQuantityUpdate"
                                />
                            </li>
                        </ul>
                    </div>

                    <div class="cart__summary">
                        <h2>Résumé de la commande</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Sous-total</td>
                                    <td>{{ subTotal }} €</td>
                                </tr>
                                <tr>
                                    <td>Livraison</td>
                                    <td>{{ shipping }} €</td>
                                </tr>
                                <tr class="total">
                                    <td>Total</td>
                                    <td>{{ total }} €</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>

            <div v-else class="cart__empty">
                <p>Le panier est vide 🍃</p>
                <a href="/boutique">
                    <button>Continuer mes achats</button>
                </a>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.cart {
    margin-top: 4rem;
    min-height: 50vh;
    
    &__wrapper {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
    }

    &__header {
        margin-bottom: 2rem;
        
        h1 {
            font-size: 2rem;
        }
    }

    &__main {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;

        @media screen and (min-width: 992px) {
            grid-template-columns: 2fr 1fr;
        }
    }

    &__items {
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
    }

    &__summary {
        background-color: #fafafa;
        padding: 2rem;
        border-radius: 4px;
        height: fit-content;

        h2 {
            margin-bottom: 1.5rem;
        }

        table {
            width: 100%;
            margin: 1rem 0;
            border-collapse: collapse;

            tr {
                height: 48px;
                
                td {
                    &:last-child {
                        text-align: right;
                    }
                }

                &.total {
                    td {
                        border-top: 1px solid black;
                        font-weight: 900;
                    }
                }
            }
        }
    }

    &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        text-align: center;

        p {
            font-size: 2rem;
            margin-bottom: 2rem;
        }

        button {
            margin-top: 1rem;
            border: none;
            padding: 1rem 2rem;
            background-color: #b39966;
            color: #f3f1ed;
            font-size: 1rem;
            cursor: pointer;
            transition: opacity 0.3s ease;

            &:hover {
                opacity: 0.9;
            }
        }
    }
}
</style>
