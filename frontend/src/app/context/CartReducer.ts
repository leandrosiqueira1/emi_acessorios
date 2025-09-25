import { CartState, CartAction } from "./CartType";


export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const exists = state.cart.find(i => i.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantity: 1 }] };
    }

    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter(i => i.id !== action.payload) };

    case "INCREASE_QTY":
      return { ...state, cart: state.cart.map(i => i.id === action.payload ? { ...i, quantity: i.quantity + 1 } : i) };

    case "DECREASE_QTY":
      return {
        ...state,
        cart: state.cart
          .map(i => i.id === action.payload ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i)
          .filter(i => i.quantity > 0),
      };

    case "CLEAR_CART":
      return { ...state, cart: [] };

    default:
      return state;
  }
}
