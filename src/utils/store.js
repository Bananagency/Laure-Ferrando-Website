import { atom } from "nanostores";
export const cart = atom([]);
export const weight = atom(0);
export const total = atom(0);

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

  updateTotal();
  updateWeight();
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
    updateTotal();
    updateWeight();
    storeLocalSession();
  } else {
    console.log("❌ l'article que vous voulez supprimé n'existe pas !");
  }
}

export function updateTotal() {
  const cartState = cart.get();
  const totalQuantity = Object.values(cartState).reduce((sum, item) => {
    return sum + (item.quantity || 0);
  }, 0);
  total.set(totalQuantity);
  console.log("Total items:", totalQuantity);
}

export function updateWeight() {
  const cartState = cart.get();
  console.log('🔄 Mise à jour du poids - État du panier:', cartState);
  
  const totalWeight = Object.values(cartState).reduce((sum, item) => {
    const itemWeight = parseFloat(item.weight || 0) * (item.quantity || 0);
    console.log(`📦 Article "${item.name}":`, {
      poids_unitaire: item.weight,
      type_poids: typeof item.weight,
      quantite: item.quantity,
      poids_total: itemWeight
    });
    return sum + itemWeight;
  }, 0);
  
  const roundedWeight = parseFloat(totalWeight.toFixed(2));
  weight.set(roundedWeight);
  console.log('⚖️ Poids total du panier:', roundedWeight, 'kg');
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
  updateTotal();
  updateWeight();
  storeLocalSession();
  console.log(`✅ Mise à jour terminée pour l'article ${id}`);
}

function storeLocalSession() {
  const cartState = cart.get();
  localStorage.setItem("cart", JSON.stringify(cartState));
}
