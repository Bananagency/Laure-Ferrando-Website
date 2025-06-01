<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from '@nanostores/vue';
import { cart, subTotal, shipping, weight, total, updateTotals } from '../../utils/store';
import { Fetcher } from '../../utils/fetchUtils';

const isClient = ref(false);

onMounted(() => {
    isClient.value = true;
});

const $cart = useStore(cart);
const $subTotal = useStore(subTotal);
const $shipping = useStore(shipping);
const $weight = useStore(weight);
const $total = useStore(total);

// Initialisation des valeurs avec des valeurs par défaut
const cartItems = computed(() => $cart.value || []);
const subtotalValue = computed(() => $subTotal.value || 0);
const shippingValue = computed(() => $shipping.value || 0);
const weightValue = computed(() => $weight.value || 0);
const totalValue = computed(() => $total.value || 0);

const sameAddress = ref(false);
const orderStatus = ref('pending'); // 'pending', 'success', 'error'
const orderError = ref('');
const orderDetails = ref(null);

const formData = ref({
    shipping: {
        first_name: '',
        last_name: '',
        address: '',
        city: '',
        postcode: '',
        country: 'France',
        phone: '',
        email: ''
    },
    billing: {
        first_name: '',
        last_name: '',
        address: '',
        city: '',
        postcode: '',
        country: 'France'
    },
    payment_method: "sumup",
    payment_method_title: "Carte bancaire",
    set_paid: false,
    line_items: $cart.value,
    shipping_lines: [{
        method_id: "flat_rate",
        method_title: "Livraison standard",
        total: $shipping.value
    }]
});


const handleSubmit = async () => {
    if (!sameAddress.value) {
        formData.value.billing = {
            first_name: formData.value.shipping.first_name,
            last_name: formData.value.shipping.last_name,
            address: formData.value.shipping.address,
            city: formData.value.shipping.city,
            postcode: formData.value.shipping.postcode,
            country: formData.value.shipping.country
        };
    }
    const orderData = {
        payment_method: "sumup",
        payment_method_title: "Carte bancaire",
        set_paid: false,
        status: "pending",
        billing: {
            first_name: formData.value.billing.first_name,
            last_name: formData.value.billing.last_name,
            address_1: formData.value.billing.address,
            city: formData.value.billing.city,
            postcode: formData.value.billing.postcode,
            country: formData.value.billing.country,
            email: formData.value.shipping.email,
            phone: formData.value.shipping.phone,
            state: ""
        },
        shipping: {
            first_name: formData.value.shipping.first_name,
            last_name: formData.value.shipping.last_name,
            address_1: formData.value.shipping.address,
            city: formData.value.shipping.city,
            postcode: formData.value.shipping.postcode,
            country: formData.value.shipping.country,
            state: ""
        },
        line_items: $cart.value.map(item => ({
            product_id: parseInt(item.id),
            quantity: parseInt(item.quantity),
            total: (parseFloat(item.price) * parseInt(item.quantity)).toString()
        })),
        shipping_lines: [{
            method_id: "flat_rate",
            method_title: "Livraison standard",
            total: parseFloat($shipping.value).toString()
        }],
        total: parseFloat($total.value).toString()
    };

    console.log('📦 Données envoyées:', orderData);

    try {
        const fetcher = new Fetcher();
        const response = await fetcher.fetchData('/wp-json/wc/v3/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        }); 

        console.log('✅ Réponse reçue:', response);
        
        if (response && response.id) {
            // Construction de l'URL de paiement WooCommerce
            const paymentUrl = `https://admin.laure-ferrando.com/commander/order-pay/${response.id}/?pay_for_order=true&key=${response.order_key}`;
            // Redirection vers la page de paiement
            window.location.href = paymentUrl;
        } else {
            throw new Error('Réponse invalide de l\'API');
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        orderStatus.value = 'error';
        orderError.value = error.message || 'Une erreur est survenue lors de la création de la commande';
    }
}

</script>

<template>
    <div v-if="isClient" class="checkout" client:only="vue">
        <div class="checkout__container">
            <h1>Paiement</h1>
            
            <div v-if="orderStatus === 'success'" class="checkout__success">
                <div class="checkout__success-icon">✓</div>
                <h2>Commande confirmée !</h2>
                <p>Votre commande a été enregistrée avec succès.</p>
                <div class="checkout__success-details">
                    <h3>Détails de la commande</h3>
                    <p>Numéro de commande : #{{ orderDetails?.id }}</p>
                    <p>Date de la commande : {{ new Date(orderDetails?.date_created).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</p>
                    <p>Cout de la livraison : {{ orderDetails?.shipping_total }} €</p>
                    <p>Total : {{ orderDetails?.total }} €</p>
                    <p>Mode de paiement : {{ orderDetails?.payment_method_title }}</p>

                    <div class="checkout__success-address">
                        <h4>Adresse de livraison</h4>
                        <p>{{ orderDetails?.shipping.first_name }} {{ orderDetails?.shipping.last_name }}</p>
                        <p>{{ orderDetails?.shipping.address_1 }}</p>
                        <p>{{ orderDetails?.shipping.postcode }} {{ orderDetails?.shipping.city }}</p>
                        <p>{{ orderDetails?.shipping.country }}</p>
                        <p>Téléphone : {{ orderDetails?.shipping.phone }}</p>
                    </div>

                    <div class="checkout__success-items">
                        <h4>Produits commandés</h4>
                        <ul>
                            <li v-for="item in orderDetails?.line_items" :key="item.id" class="checkout__success-item">
                                <div class="checkout__success-item-info">
                                    <span class="checkout__success-item-name">{{ item.name }}</span>
                                    <span class="checkout__success-item-quantity">x{{ item.quantity }}</span>
                                </div>
                                <span class="checkout__success-item-price">{{ item.total }} €</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="checkout__success-actions">
                    <a href="/" class="checkout__success-button">Retour à l'accueil</a>
                </div>
            </div>

            <div v-else-if="orderStatus === 'error'" class="checkout__error">
                <div class="checkout__error-icon">!</div>
                <h2>Une erreur est survenue</h2>
                <p>{{ orderError }}</p>
                <button @click="orderStatus = 'pending'" class="checkout__error-button">
                    Réessayer
                </button>
            </div>

            <div v-else class="checkout__grid">
                <form class="checkout__form" id="checkout-form">
                    <div class="checkout__section">
                        <h2>Adresse de livraison</h2>
                        <div class="checkout__form-group">
                            <div class="checkout__form-row">
                                <div class="checkout__form-field">
                                    <label for="shipping-firstName">Prénom</label>
                                    <input 
                                        type="text" 
                                        id="shipping-firstName" 
                                        v-model="formData.shipping.first_name" 
                                        required
                                    >
                                </div>
                                <div class="checkout__form-field">
                                    <label for="shipping-lastName">Nom</label>
                                    <input 
                                        type="text" 
                                        id="shipping-lastName" 
                                        v-model="formData.shipping.last_name" 
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
                                        v-model="formData.shipping.postcode" 
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
                                        v-model="formData.billing.first_name" 
                                        required
                                    >
                                </div>
                                <div class="checkout__form-field">
                                    <label for="billing-lastName">Nom</label>
                                    <input 
                                        type="text" 
                                        id="billing-lastName" 
                                        v-model="formData.billing.last_name" 
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
                                        v-model="formData.billing.postcode" 
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
                                <li v-for="item in cartItems" :key="item.id" class="checkout__summary__item">
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
                                    <td>{{ subtotalValue }} €</td>
                                </tr>
                                <tr>
                                    <td>Poids total</td>
                                    <td>{{ weightValue }} kg</td>
                                </tr>
                                <tr>
                                    <td>Livraison</td>
                                    <td>{{ shippingValue }} €</td>
                                </tr>
                                <tr class="total">
                                    <td>Total</td>
                                    <td>{{ totalValue }} €</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button @click.prevent="handleSubmit" class="checkout__submit">
                        Procéder au paiement
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="checkout">
        <div class="checkout__container">
            <h1>Paiement</h1>
            <div class="checkout__loading">
                <div class="checkout__loader"></div>
                <p>Chargement de votre panier...</p>
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

    &__success,
    &__error {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        text-align: center;
        background-color: #fafafa;
        border-radius: 4px;

        @media screen and (max-width: 768px) {
            margin: 1rem auto;
            padding: 1.5rem;
        }

        h2 {
            margin: 1rem 0;
            font-size: 1.5rem;
            color: #333;

            @media screen and (max-width: 768px) {
                font-size: 1.25rem;
            }
        }

        p {
            color: #666;
            margin-bottom: 1rem;
        }
    }

    &__success {
        &-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto;
            background-color: #4CAF50;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
        }

        &-details {
            margin: 2rem 0;
            padding: 1.5rem;
            background-color: white;
            border-radius: 4px;
            text-align: left;

            h3 {
                margin-bottom: 1rem;
                font-size: 1.2rem;
                color: #333;
            }

            h4 {
                margin: 1.5rem 0 0.75rem;
                font-size: 1.1rem;
                color: #333;
            }

            p {
                margin: 0.5rem 0;
                color: #666;
            }
        }

        &-address {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #eee;
        }

        &-items {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #eee;

            ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
        }

        &-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid #eee;

            &:last-child {
                border-bottom: none;
            }

            &-info {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            &-name {
                font-weight: 500;
            }

            &-quantity {
                font-size: 0.9rem;
                color: #666;
            }

            &-price {
                font-weight: 500;
            }
        }

        &-actions {
            margin-top: 2rem;
        }

        &-button {
            display: inline-block;
            padding: 1rem 2rem;
            background-color: #b39966;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: opacity 0.3s ease;

            &:hover {
                opacity: 0.9;
            }

            @media screen and (max-width: 768px) {
                padding: 0.875rem 1.5rem;
            }
        }
    }

    &__error {
        &-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto;
            background-color: #f44336;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
        }

        &-button {
            margin-top: 1rem;
            padding: 1rem 2rem;
            background-color: #b39966;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: opacity 0.3s ease;

            &:hover {
                opacity: 0.9;
            }

            @media screen and (max-width: 768px) {
                padding: 0.875rem 1.5rem;
            }
        }
    }
}

.checkout__loading {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    p {
        font-size: 1.1rem;
        margin: 0;
    }
}

.checkout__loader {
    width: 48px;
    height: 48px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #b39966;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
