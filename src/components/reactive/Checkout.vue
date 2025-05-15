<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from '@nanostores/vue';
import { cart, subTotal, shipping, weight, total } from '../../utils/store';

const $cart = useStore(cart);
const $subTotal = useStore(subTotal);
const $shipping = useStore(shipping);
const $weight = useStore(weight);
const $total = useStore(total);
const sameAddress = ref(false);

const formData = ref({
    shipping: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'France',
        phone: '',
        email: ''
    },
    billing: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'France'
    }
});

const calculateShipping = (weight) => {
    if (weight < 1) {
        return 5;
    } else if (weight >= 1 && weight <= 5) {
        return 10;
    } else {
        return 15;
    }
};

const calculateTotals = () => {
    if ($cart.value.length > 0) {
        let totalPrice = 0;
        let totalW = 0;
        $cart.value.forEach((item) => {
            totalPrice += item.quantity * item.price;
            totalW += item.quantity * (item.weight || 0);
        });
        $subTotal.value = totalPrice;
        $weight.value = parseFloat(totalW.toFixed(2));
        $shipping.value = calculateShipping($weight.value);
    }
};

onMounted(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartData.length === 0) {
        window.location.href = '/panier';
    }
    calculateTotals();
});

const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de soumission du formulaire à implémenter
    console.log('Formulaire soumis:', formData.value);
};

const toggleBillingAddress = () => {
    if (!sameAddress.value) {
        formData.value.billing = { ...formData.value.shipping };
    }
};
</script>

<template>
    <div class="checkout">
        <div class="checkout__container">
            <h1>Paiement</h1>
            
            <div class="checkout__grid">
                <form @submit="handleSubmit" class="checkout__form">
                    <div class="checkout__section">
                        <h2>Adresse de livraison</h2>
                        <div class="checkout__form-group">
                            <div class="checkout__form-row">
                                <div class="checkout__form-field">
                                    <label for="shipping-firstName">Prénom</label>
                                    <input 
                                        type="text" 
                                        id="shipping-firstName" 
                                        v-model="formData.shipping.firstName" 
                                        required
                                    >
                                </div>
                                <div class="checkout__form-field">
                                    <label for="shipping-lastName">Nom</label>
                                    <input 
                                        type="text" 
                                        id="shipping-lastName" 
                                        v-model="formData.shipping.lastName" 
                                        required
                                    >
                                </div>
                            </div>
                            
                            <div class="checkout__form-field">
                                <label for="shipping-address">Adresse</label>
                                <input 
                                    type="text" 
                                    id="shipping-address" 
                                    v-model="formData.shipping.address" 
                                    required
                                >
                            </div>
                            
                            <div class="checkout__form-row">
                                <div class="checkout__form-field">
                                    <label for="shipping-city">Ville</label>
                                    <input 
                                        type="text" 
                                        id="shipping-city" 
                                        v-model="formData.shipping.city" 
                                        required
                                    >
                                </div>
                                <div class="checkout__form-field">
                                    <label for="shipping-postalCode">Code postal</label>
                                    <input 
                                        type="text" 
                                        id="shipping-postalCode" 
                                        v-model="formData.shipping.postalCode" 
                                        required
                                    >
                                </div>
                            </div>
                            
                            <div class="checkout__form-field">
                                <label for="shipping-phone">Téléphone</label>
                                <input 
                                    type="tel" 
                                    id="shipping-phone" 
                                    v-model="formData.shipping.phone" 
                                    required
                                >
                            </div>
                            
                            <div class="checkout__form-field">
                                <label for="shipping-email">Email</label>
                                <input 
                                    type="email" 
                                    id="shipping-email" 
                                    v-model="formData.shipping.email" 
                                    required
                                >
                            </div>
                        </div>
                    </div>

                    <div class="checkout__toggle">
                        <label class="checkout__toggle-label">
                            <input 
                                type="checkbox" 
                                v-model="sameAddress"
                                @change="toggleBillingAddress"
                            >
                            <span class="checkout__toggle-text">Utiliser une adresse de facturation différente</span>
                        </label>
                    </div>

                    <div v-if="sameAddress" class="checkout__section">
                        <h2>Adresse de facturation</h2>
                        <div class="checkout__form-group">
                            <div class="checkout__form-row">
                                <div class="checkout__form-field">
                                    <label for="billing-firstName">Prénom</label>
                                    <input 
                                        type="text" 
                                        id="billing-firstName" 
                                        v-model="formData.billing.firstName" 
                                        required
                                    >
                                </div>
                                <div class="checkout__form-field">
                                    <label for="billing-lastName">Nom</label>
                                    <input 
                                        type="text" 
                                        id="billing-lastName" 
                                        v-model="formData.billing.lastName" 
                                        required
                                    >
                                </div>
                            </div>
                            
                            <div class="checkout__form-field">
                                <label for="billing-address">Adresse</label>
                                <input 
                                    type="text" 
                                    id="billing-address" 
                                    v-model="formData.billing.address" 
                                    required
                                >
                            </div>
                            
                            <div class="checkout__form-row">
                                <div class="checkout__form-field">
                                    <label for="billing-city">Ville</label>
                                    <input 
                                        type="text" 
                                        id="billing-city" 
                                        v-model="formData.billing.city" 
                                        required
                                    >
                                </div>
                                <div class="checkout__form-field">
                                    <label for="billing-postalCode">Code postal</label>
                                    <input 
                                        type="text" 
                                        id="billing-postalCode" 
                                        v-model="formData.billing.postalCode" 
                                        required
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div class="checkout__summary-wrapper">
                    <div class="checkout__summary">
                        <h2>Récapitulatif de la commande</h2>
                        <div class="checkout__summary__items">
                            <ul>
                                <li v-for="item in $cart" :key="item.id" class="checkout__summary__item">
                                    <div class="checkout__summary__item__info">
                                        <span class="checkout__summary__item__name">{{ item.name }}</span>
                                        <span class="checkout__summary__item__quantity">x{{ item.quantity }}</span>
                                    </div>
                                    <span class="checkout__summary__item__price">{{ item.price * item.quantity }} €</span>
                                </li>
                            </ul>
                        </div>
                        <table class="checkout__summary__totals">
                            <tbody>
                                <tr>
                                    <td>Sous-total</td>
                                    <td>{{ $subTotal }} €</td>
                                </tr>
                                <tr>
                                    <td>Poids total</td>
                                    <td>{{ $weight }} kg</td>
                                </tr>
                                <tr>
                                    <td>Livraison</td>
                                    <td>{{ $shipping }} €</td>
                                </tr>
                                <tr class="total">
                                    <td>Total</td>
                                    <td>{{ $total }} €</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button type="submit" form="checkout-form" class="checkout__submit">
                        Procéder au paiement
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.checkout {
    max-width: 1280px;
    margin: 4rem auto;
    padding: 0 2rem;

    @media screen and (max-width: 768px) {
        margin: 2rem auto;
        padding: 0 1rem;
    }

    &__container {
        h1 {
            margin-bottom: 2rem;
            font-size: 2rem;

            @media screen and (max-width: 768px) {
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
            }
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;

        @media screen and (min-width: 992px) {
            grid-template-columns: 1.5fr 1fr;
        }
    }

    &__form {
        max-width: 800px;
    }

    &__section {
        margin-bottom: 2rem;
        padding: 2rem;
        background-color: #fafafa;
        border-radius: 4px;

        @media screen and (max-width: 768px) {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }

        h2 {
            margin-bottom: 1.5rem;
            font-size: 1.5rem;

            @media screen and (max-width: 768px) {
                font-size: 1.25rem;
                margin-bottom: 1rem;
            }
        }
    }

    &__form-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    &__form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;

        @media screen and (max-width: 480px) {
            grid-template-columns: 1fr;
        }
    }

    &__form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
            font-size: 0.9rem;
            color: #666;
        }

        input {
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;

            &:focus {
                outline: none;
                border-color: #b39966;
            }
        }
    }

    &__toggle {
        margin: 2rem 0;
        
        &-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }

        &-text {
            font-size: 0.9rem;
            color: #666;
        }

        input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #b39966;
        }
    }

    &__summary-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        height: fit-content;

        @media screen and (min-width: 992px) {
            position: sticky;
            top: 2rem;
        }
    }

    &__summary {
        background-color: #fafafa;
        padding: 2rem;
        border-radius: 4px;

        @media screen and (max-width: 768px) {
            padding: 1.5rem;
        }

        h2 {
            margin-bottom: 1.5rem;
            font-size: 1.5rem;

            @media screen and (max-width: 768px) {
                font-size: 1.25rem;
                margin-bottom: 1rem;
            }
        }

        &__items {
            margin-bottom: 2rem;

            ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
        }

        &__item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid #eee;

            &:last-child {
                border-bottom: none;
            }

            &__info {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            &__name {
                font-weight: 500;
            }

            &__quantity {
                font-size: 0.9rem;
                color: #666;
            }

            &__price {
                font-weight: 500;
            }
        }

        &__totals {
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

    &__submit {
        width: 100%;
        padding: 1rem 2rem;
        background-color: #b39966;
        color: #f3f1ed;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        transition: opacity 0.3s ease;
        border-radius: 4px;

        &:hover {
            opacity: 0.9;
        }

        @media screen and (max-width: 768px) {
            padding: 0.875rem 1.5rem;
        }
    }
}
</style>
