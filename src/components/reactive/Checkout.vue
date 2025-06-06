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
const orderStatus = ref('pending'); // 'pending', 'success', 'error', 'processing'
const orderError = ref('');
const orderDetails = ref(null);
const isLoading = ref(false);

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
    isLoading.value = true;
    orderStatus.value = 'processing';
    
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
            
            // Attendre 5 secondes avant la redirection
            setTimeout(() => {
                window.location.href = paymentUrl;
            }, 5000);
        } else {
            throw new Error('Réponse invalide de l\'API');
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        isLoading.value = false;
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

            <div v-else-if="orderStatus === 'processing'" class="checkout__processing">
                <div class="checkout__processing-icon">
                    <div class="checkout__processing-spinner"></div>
                </div>
                <h2>Traitement de votre commande...</h2>
                <p>Veuillez patienter pendant que nous finalisons votre commande.</p>
                <p class="checkout__processing-redirect">Vous allez être redirigé vers la page de paiement dans quelques instants.</p>
                <div class="checkout__processing-progress">
                    <div class="checkout__processing-progress-bar"></div>
                </div>
            </div>

            <div v-else-if="orderStatus === 'error'" class="checkout__error">
                <div class="checkout__error-icon">!</div>
                <h2>Une erreur est survenue</h2>
                <p>{{ orderError }}</p>
                <button @click="orderStatus = 'pending'; isLoading = false;" class="checkout__error-button">
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
                    <button @click.prevent="handleSubmit" :disabled="isLoading" class="checkout__submit">
                        <span v-if="!isLoading">Procéder au paiement</span>
                        <span v-else class="checkout__submit-loading">
                            <div class="checkout__submit-spinner"></div>
                            Traitement en cours...
                        </span>
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
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    @media screen and (max-width: 768px) {
        margin: 2rem auto;
        padding: 0 1rem;
    }

    &__container {
        h1 {
            margin-bottom: 3rem;
            font-size: 2.5rem;
            font-weight: 700;
            color: #1a1a1a;
            text-align: center;
            letter-spacing: -0.025em;

            @media screen and (max-width: 768px) {
                font-size: 2rem;
                margin-bottom: 2rem;
            }
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 3rem;

        @media screen and (min-width: 992px) {
            grid-template-columns: 1.5fr 1fr;
        }
    }

    &__form {
        max-width: 800px;
    }

    &__section {
        margin-bottom: 2rem;
        padding: 2.5rem;
        background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(179, 153, 102, 0.1);
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
        }

        @media screen and (max-width: 768px) {
            padding: 2rem;
            margin-bottom: 1.5rem;
        }

        h2 {
            margin-bottom: 2rem;
            font-size: 1.75rem;
            font-weight: 600;
            color: #2d2d2d;
            position: relative;
            padding-bottom: 0.75rem;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 60px;
                height: 3px;
                background: linear-gradient(90deg, #b39966, #d4c49a);
                border-radius: 2px;
            }

            @media screen and (max-width: 768px) {
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
            }
        }
    }

    &__form-group {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    &__form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;

        @media screen and (max-width: 480px) {
            grid-template-columns: 1fr;
        }
    }

    &__form-field {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        label {
            font-size: 0.95rem;
            font-weight: 500;
            color: #4a4a4a;
            letter-spacing: 0.025em;
        }

        input {
            padding: 1rem 1.25rem;
            border: 2px solid #e8e8e8;
            border-radius: 12px;
            font-size: 1rem;
            background-color: #fff;
            transition: all 0.3s ease;
            font-family: inherit;

            &::placeholder {
                color: #999;
            }

            &:focus {
                outline: none;
                border-color: #b39966;
                box-shadow: 0 0 0 3px rgba(179, 153, 102, 0.1);
                transform: translateY(-1px);
            }

            &:hover {
                border-color: #d0d0d0;
            }
        }
    }

    &__toggle {
        margin: 2.5rem 0;
        
        &-label {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            padding: 1.25rem;
            background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);
            border-radius: 12px;
            border: 2px solid transparent;
            transition: all 0.3s ease;

            &:hover {
                border-color: rgba(179, 153, 102, 0.2);
                transform: translateY(-1px);
            }
        }

        &-text {
            font-size: 1rem;
            font-weight: 500;
            color: #4a4a4a;
        }

        input[type="checkbox"] {
            width: 20px;
            height: 20px;
            accent-color: #b39966;
            cursor: pointer;
        }
    }

    &__summary-wrapper {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        height: fit-content;

        @media screen and (min-width: 992px) {
            position: sticky;
            top: 2rem;
        }
    }

    &__summary {
        background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
        padding: 2.5rem;
        border-radius: 16px;
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(179, 153, 102, 0.1);

        @media screen and (max-width: 768px) {
            padding: 2rem;
        }

        h2 {
            margin-bottom: 2rem;
            font-size: 1.75rem;
            font-weight: 600;
            color: #2d2d2d;
            position: relative;
            padding-bottom: 0.75rem;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 60px;
                height: 3px;
                background: linear-gradient(90deg, #b39966, #d4c49a);
                border-radius: 2px;
            }

            @media screen and (max-width: 768px) {
                font-size: 1.5rem;
                margin-bottom: 1.5rem;
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
            align-items: flex-start;
            padding: 1rem 0;
            border-bottom: 1px solid rgba(232, 232, 232, 0.6);
            transition: background-color 0.2s ease;

            &:hover {
                background-color: rgba(179, 153, 102, 0.03);
                margin: 0 -0.5rem;
                padding: 1rem 0.5rem;
                border-radius: 8px;
            }

            &:last-child {
                border-bottom: none;
            }

            &__info {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                flex: 1;
            }

            &__name {
                font-weight: 600;
                color: #2d2d2d;
                font-size: 1rem;
                line-height: 1.4;
            }

            &__quantity {
                font-size: 0.9rem;
                color: #666;
                font-weight: 500;
                background-color: rgba(179, 153, 102, 0.1);
                padding: 0.2rem 0.6rem;
                border-radius: 20px;
                width: fit-content;
            }

            &__price {
                font-weight: 700;
                color: #b39966;
                font-size: 1.1rem;
                margin-left: 1rem;
            }
        }

        &__totals {
            width: 100%;
            margin: 1.5rem 0;
            border-collapse: collapse;
            background-color: rgba(250, 250, 250, 0.5);
            border-radius: 12px;
            overflow: hidden;

            tr {
                height: 56px;
            
                td {
                    padding: 0 1.25rem;
                    font-weight: 500;
                    color: #4a4a4a;

                    &:last-child {
                        text-align: right;
                        font-weight: 600;
                        color: #2d2d2d;
                    }
                }

                &.total {
                    background: linear-gradient(135deg, #b39966 0%, #d4c49a 100%);
                    
                    td {
                        color: white;
                        font-weight: 700;
                        font-size: 1.1rem;
                        border-top: none;
                    }
                }
            }
        }
    }

    &__submit {
        width: 100%;
        padding: 1.25rem 2rem;
        background: linear-gradient(135deg, #b39966 0%, #d4c49a 100%);
        color: white;
        border: none;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(179, 153, 102, 0.3);
        letter-spacing: 0.025em;
        text-transform: uppercase;
        font-family: inherit;
        position: relative;
        overflow: hidden;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(179, 153, 102, 0.4);
        }

        &:active:not(:disabled) {
            transform: translateY(0);
        }

        &:disabled {
            opacity: 0.8;
            cursor: not-allowed;
            transform: none;
        }

        &-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }

        &-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @media screen and (max-width: 768px) {
            padding: 1rem 1.5rem;
            font-size: 1rem;
        }
    }

    &__success,
    &__error,
    &__processing {
        max-width: 700px;
        margin: 3rem auto;
        padding: 3rem;
        text-align: center;
        background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

        @media screen and (max-width: 768px) {
            margin: 2rem auto;
            padding: 2rem;
        }

        h2 {
            margin: 1.5rem 0;
            font-size: 1.75rem;
            font-weight: 700;
            color: #2d2d2d;

            @media screen and (max-width: 768px) {
                font-size: 1.5rem;
            }
        }

        p {
            color: #666;
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
            line-height: 1.6;
        }
    }

    &__processing {
        &-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto;
            background: linear-gradient(135deg, #b39966 0%, #d4c49a 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 20px rgba(179, 153, 102, 0.3);
            animation: processingPulse 2s ease-in-out infinite;
        }

        &-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        &-redirect {
            font-style: italic;
            color: #888;
            font-size: 1rem;
            margin-top: 1rem;
        }

        &-progress {
            margin: 2rem auto 0;
            width: 100%;
            max-width: 400px;
            height: 6px;
            background-color: rgba(179, 153, 102, 0.2);
            border-radius: 3px;
            overflow: hidden;
        }

        &-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #b39966, #d4c49a);
            border-radius: 3px;
            animation: progressBar 5s linear forwards;
            transform: translateX(-100%);
        }
    }

    &__success {
        &-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            font-weight: bold;
            box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
            animation: successPulse 2s ease-in-out infinite;
        }

        &-details {
            margin: 2.5rem 0;
            padding: 2rem;
            background-color: white;
            border-radius: 16px;
            text-align: left;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(232, 232, 232, 0.8);

            h3 {
                margin-bottom: 1.5rem;
                font-size: 1.3rem;
                font-weight: 600;
                color: #2d2d2d;
            }

            h4 {
                margin: 2rem 0 1rem;
                font-size: 1.15rem;
                font-weight: 600;
                color: #2d2d2d;
                position: relative;
                padding-bottom: 0.5rem;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 40px;
                    height: 2px;
                    background: #b39966;
                    border-radius: 1px;
                }
            }

            p {
                margin: 0.75rem 0;
                color: #555;
                font-size: 1rem;
                line-height: 1.5;
            }
        }

        &-address {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 2px solid rgba(232, 232, 232, 0.8);
        }

        &-items {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 2px solid rgba(232, 232, 232, 0.8);

            ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
        }

        &-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            margin: 0.5rem 0;
            background-color: rgba(250, 250, 250, 0.8);
            border-radius: 10px;
            transition: all 0.2s ease;

            &:hover {
                background-color: rgba(179, 153, 102, 0.05);
                transform: translateX(5px);
            }

            &:last-child {
                border-bottom: none;
            }

            &-info {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            &-name {
                font-weight: 600;
                color: #2d2d2d;
            }

            &-quantity {
                font-size: 0.9rem;
                color: #666;
                background-color: rgba(179, 153, 102, 0.1);
                padding: 0.2rem 0.6rem;
                border-radius: 20px;
                width: fit-content;
                font-weight: 500;
            }

            &-price {
                font-weight: 700;
                color: #b39966;
                font-size: 1.1rem;
            }
        }

        &-actions {
            margin-top: 2.5rem;
        }

        &-button {
            display: inline-block;
            padding: 1.25rem 2.5rem;
            background: linear-gradient(135deg, #b39966 0%, #d4c49a 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 1.05rem;
            letter-spacing: 0.025em;
            text-transform: uppercase;
            box-shadow: 0 4px 15px rgba(179, 153, 102, 0.3);

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(179, 153, 102, 0.4);
            }

            @media screen and (max-width: 768px) {
                padding: 1rem 2rem;
            }
        }
    }

    &__error {
        &-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto;
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            font-weight: bold;
            box-shadow: 0 6px 20px rgba(244, 67, 54, 0.3);
            animation: errorShake 0.5s ease-in-out;
        }

        &-button {
            margin-top: 1.5rem;
            padding: 1.25rem 2rem;
            background: linear-gradient(135deg, #b39966 0%, #d4c49a 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 1.05rem;
            letter-spacing: 0.025em;
            text-transform: uppercase;
            box-shadow: 0 4px 15px rgba(179, 153, 102, 0.3);
            font-family: inherit;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(179, 153, 102, 0.4);
            }

            @media screen and (max-width: 768px) {
                padding: 1rem 1.5rem;
            }
        }
    }
}

.checkout__loading {
    text-align: center;
    padding: 5rem 2rem;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;

    p {
        font-size: 1.2rem;
        margin: 0;
        font-weight: 500;
        color: #4a4a4a;
    }
}

.checkout__loader {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(179, 153, 102, 0.1);
    border-top: 4px solid #b39966;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-shadow: 0 4px 15px rgba(179, 153, 102, 0.2);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes successPulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
    }
}

@keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

@keyframes processingPulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 6px 20px rgba(179, 153, 102, 0.3);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 8px 25px rgba(179, 153, 102, 0.4);
    }
}

@keyframes progressBar {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(0);
    }
}

// Focus styles for accessibility
*:focus-visible {
    outline: 2px solid #b39966;
    outline-offset: 2px;
}
</style>
