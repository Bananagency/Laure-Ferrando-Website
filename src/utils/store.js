import { atom, map } from "nanostores";
export const cart = map({});
export const total = atom(0);

export function addCartItem(id) {
  const existingEntry = cart.get()[id];
  if (!existingEntry) {
    cart.setKey(id, { quantity: 1 }); // Ajoute l'élément avec une quantité de 1
  } else {
    cart.setKey(id, { quantity: existingEntry.quantity + 1 }); // Incrémente la quantité si l'élément existe déjà
  }
  updateTotal();
  storeLocaLsession();
  console.log("Cart state:", cart.get());
}

export function updateTotal() {
  const cartState = cart.get(); // Récupère l'état actuel du panier
  const totalQuantity = Object.values(cartState).reduce((sum, item) => {
    return sum + (item.quantity || 0); // Additionne les quantités
  }, 0);
  total.set(totalQuantity); // Met à jour le store `total`
  console.log("Total items:", totalQuantity);
}

function storeLocaLsession() {
  const cartState = cart.get();
  sessionStorage.setItem("cart", JSON.stringify(cartState));
}
