import { atom, computed } from "nanostores";

export const cart = atom([]);
export const weight = atom(0);
export const total = atom(0);
export const subTotal = atom(0);
export const shipping = atom(0);
export const totalItems = atom(0);

const calculateShipping = (weight) => {
    if (weight < 1) {
        return 5;
    } else if (weight >= 1 && weight <= 5) {
        return 10;
    } else {
        return 15;
    }
};

export function updateTotals() {
    const cartState = cart.get();
    let totalPrice = 0;
    let totalWeight = 0;
    let itemsCount = 0;

    cartState.forEach((item) => {
        totalPrice += item.quantity * item.price;
        totalWeight += item.quantity * (item.weight || 0);
        itemsCount += item.quantity;
    });

    const roundedWeight = parseFloat(totalWeight.toFixed(2));
    const shippingCost = calculateShipping(roundedWeight);

    weight.set(roundedWeight);
    subTotal.set(totalPrice);
    shipping.set(shippingCost);
    total.set(totalPrice + shippingCost);
    totalItems.set(itemsCount);
}

function storeLocalSession() {
    const cartState = cart.get();
    localStorage.setItem("cart", JSON.stringify(cartState));
}

function initializeStore() {
    if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            cart.set(parsedCart);
            updateTotals();
        }
    }
}

// Initialisation du store
initializeStore();

export function addCartItem(id, name, image, price, weight) {
    const cartState = cart.get();
    const weightAsNumber = weight ? parseFloat(weight.toString()) : 0;
    
    console.log('➕ Ajout d\'article:', {
        id,
        nom: name,
        poids_brut: weight,
        poids_converti: weightAsNumber,
        type_poids_brut: typeof weight,
        type_poids_converti: typeof weightAsNumber
    });
    
    const existingEntryIndex = cartState.findIndex((item) => item.id === id);

    if (existingEntryIndex === -1) {
        console.log('📝 Nouvel article ajouté au panier');
        cart.set([
            ...cartState,
            { id: id, name: name, image: image, price: price, weight: weightAsNumber, quantity: 1 },
        ]);
    } else {
        console.log('📈 Incrémentation de la quantité d\'un article existant');
        const updatedCart = [...cartState];
        updatedCart[existingEntryIndex].quantity += 1;
        cart.set(updatedCart);
    }

    updateTotals();
    storeLocalSession();
    console.log("🛒 État final du panier:", cart.get());
}

export function removeCartItem(id) {
    const cartState = cart.get();
    const existingEntryIndex = cartState.findIndex((item) => item.id === id);
    if (existingEntryIndex > -1) {
        const removedItem = cartState[existingEntryIndex];
        console.log('➖ Suppression de l\'article:', removedItem.name, '- Poids:', removedItem.weight, 'kg');
        
        const updatedCart = [...cartState];
        updatedCart.splice(existingEntryIndex, 1);
        cart.set(updatedCart);
        updateTotals();
        storeLocalSession();
    } else {
        console.log("❌ l'article que vous voulez supprimé n'existe pas !");
    }
}

export function updateCartItemQuantity(id, newQuantity) {
    if (typeof newQuantity !== 'number' || newQuantity < 0) {
        console.error('❌ La quantité doit être un nombre positif');
        return;
    }

    const cartState = cart.get();
    const existingEntryIndex = cartState.findIndex((item) => item.id === id);

    if (existingEntryIndex === -1) {
        console.error('❌ Article non trouvé dans le panier');
        return;
    }

    const item = cartState[existingEntryIndex];
    console.log(`🔄 Mise à jour de la quantité - Article: ${item.name}`);
    console.log(`📊 Ancienne quantité: ${item.quantity}, Nouvelle quantité: ${newQuantity}`);
    console.log(`⚖️ Poids unitaire: ${item.weight}kg`);

    const updatedCart = [...cartState];
    
    if (newQuantity === 0) {
        console.log('🗑️ Suppression de l\'article (quantité = 0)');
        updatedCart.splice(existingEntryIndex, 1);
    } else {
        updatedCart[existingEntryIndex] = {
            ...updatedCart[existingEntryIndex],
            quantity: newQuantity
        };
    }

    cart.set(updatedCart);
    updateTotals();
    storeLocalSession();
    console.log(`✅ Mise à jour terminée pour l'article ${id}`);
}
