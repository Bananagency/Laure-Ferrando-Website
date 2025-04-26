<script lang="js" setup>
import CartItem from "./CartItem.vue";
import { useStore } from "@nanostores/vue";
import { cart } from "../../utils/store";
import { computed, onMounted, ref, watch } from "vue";

const subTotal = ref(0);
const shipping = ref(0);
const total = computed(() => subTotal.value + shipping.value);

const isLoading = ref(true);

const $cart = ref(useStore(cart));

const cost = () => {
    if ($cart.value.length > 0) {
        let e = 0;
        $cart.value.forEach((item) => {
            e += item.quantity * item.price;
        });
        subTotal.value = e;
        console.log("Sous-total calculé :", subTotal.value);
    }
};

watch(
    $cart,
    (newCart) => {
        if (newCart && newCart.length > 0) {
            console.log("Panier mis à jour :", newCart);
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
    <div class="Cart">
        <div v-if="$cart.length > 0" class="Cart__container">
            <div class="Cart__container__content">
                <h1 class="Cart__container__content__title">Mon panier</h1>
                <ul class="Cart__container__content__list">
                    <li
                        v-for="article in $cart"
                        class="Cart__container__content__list__item"
                    >
                        <CartItem
                            :article="article.id"
                            :title="article.name"
                            :image="article.image"
                            :price="article.price"
                            :quantity="article.quantity"
                        />
                    </li>
                </ul>
            </div>
            <div class="Cart__container__resume">
                <h2 class="Cart__container__resume__title">
                    Résumé de la commande
                </h2>
                <table class="Cart__container__resume__table">
                    <tbody>
                        <tr class="Cart__container__resume__table__subtotal">
                            <td>Sous-total</td>
                            <td>{{ subTotal }} €</td>
                        </tr>
                        <tr class="Cart__container__resume__table__shipping">
                            <td>Livraison</td>
                            <td>{{ shipping }} €</td>
                        </tr>
                        <tr class="Cart__container__resume__table__total">
                            <td>Total</td>
                            <td>{{ total }} €</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-else class="Cart__container" style="display: flex !important">
            <div class="Cart__container__content__empty">
                <p class="Cart__container__content__empty__text">
                    Le panier est vide 🍃
                </p>
                <a href="/boutique">
                    <button class="Cart__container__content__empty__button">
                        Continuer mes achats
                    </button>
                </a>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.Cart {
    margin-top: 3rem;
    &__container {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 2rem;
        width: 100%;
        &__content {
            flex-shrink: 0;
            grid-area: 1/1/2/8;
            &__title {
                margin-bottom: 2rem;
            }
            &__empty {
                margin: 8rem auto;
                font-size: 2rem;
                text-align: center;

                &__button {
                    margin-top: 3rem;
                    border: none;
                    padding: 1rem 2rem;
                    background-color: #b39966;
                    color: #f3f1ed;
                    font-size: 1rem;
                    cursor: pointer;
                }
            }
        }
        &__resume {
            grid-area: 1/8/2/11;
            &__table {
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
                }
                &__total {
                    td {
                        border-top: 1px solid black;
                        font-weight: 900;
                    }
                }
            }
        }
    }
}
</style>
