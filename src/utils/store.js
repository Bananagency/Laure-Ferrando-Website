import { atom } from "nanostores";
export const cart = atom([]);
export const total = atom(0);

export function addCartItem(id, name, image, price) {
  const cartState = cart.get(); // Récupère l'état actuel du panier
  const existingEntryIndex = cartState.findIndex((item) => item.id === id); // Trouve l'élément dans le tableau

  if (existingEntryIndex === -1) {
    // Si l'élément n'existe pas, ajoute un nouvel objet avec une quantité de 1
    cart.set([
      ...cartState,
      { id: id, name: name, image: image, price: price, quantity: 1 },
    ]);
  } else {
    // Si l'élément existe, incrémente sa quantité
    const updatedCart = [...cartState];
    updatedCart[existingEntryIndex].quantity += 1;
    cart.set(updatedCart);
  }

  updateTotal(); // Met à jour le total
  storeLocalSession(); // Sauvegarde dans la localStorage
  console.log("Cart state:", cart.get());
}

export function removeCartItem(id) {
  const cartState = cart.get();
  const existingEntryIndex = cartState.findIndex((item) => item.id === id); // Trouve l'élément dans le tableau
  if (existingEntryIndex > -1) {
    const updatedCart = [...cartState];
    updatedCart.splice(existingEntryIndex, 1);
    cart.set(updatedCart);
    updateTotal();
    storeLocalSession();
  } else {
    console.log("❌ l'article que vous voulez supprimé n'existe pas !");
  }
}

export function updateTotal() {
  const cartState = cart.get(); // Récupère l'état actuel du panier
  const totalQuantity = Object.values(cartState).reduce((sum, item) => {
    return sum + (item.quantity || 0); // Additionne les quantités
  }, 0);
  total.set(totalQuantity); // Met à jour le store `total`
  console.log("Total items:", totalQuantity);
}

function storeLocalSession() {
  const cartState = cart.get();
  localStorage.setItem("cart", JSON.stringify(cartState));
}
