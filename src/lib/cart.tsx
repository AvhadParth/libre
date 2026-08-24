'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState,
} from 'react';
import { products, type Product } from './products';

export type Line = { slug: string; qty: number };
type State = { lines: Line[]; hydrated: boolean };

type Action =
  | { type: 'add'; slug: string; qty?: number }
  | { type: 'setQty'; slug: string; qty: number }
  | { type: 'remove'; slug: string }
  | { type: 'clear' }
  | { type: 'hydrate'; lines: Line[] };

const KEY = 'libre.cart.v1';

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { lines: action.lines, hydrated: true };
    case 'add': {
      const qty = action.qty ?? 1;
      const found = state.lines.find((l) => l.slug === action.slug);
      return {
        ...state,
        lines: found
          ? state.lines.map((l) =>
              l.slug === action.slug ? { ...l, qty: Math.min(99, l.qty + qty) } : l,
            )
          : [...state.lines, { slug: action.slug, qty }],
      };
    }
    case 'setQty':
      return action.qty <= 0
        ? { ...state, lines: state.lines.filter((l) => l.slug !== action.slug) }
        : {
            ...state,
            lines: state.lines.map((l) =>
              l.slug === action.slug ? { ...l, qty: Math.min(99, action.qty) } : l,
            ),
          };
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.slug !== action.slug) };
    case 'clear':
      return { ...state, lines: [] };
  }
}

export type CartLine = Line & { product: Product };

type CartApi = {
  lines: CartLine[];
  count: number;
  /** null when any line has no approved price yet. */
  subtotal: number | null;
  /** True when any line's price is still a stand-in, so the total is too. */
  subtotalIsEstimate: boolean;
  hydrated: boolean;
  isOpen: boolean;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], hydrated: false });
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed: Line[] = raw ? JSON.parse(raw) : [];
      dispatch({
        type: 'hydrate',
        lines: parsed.filter((l) => products.some((p) => p.slug === l.slug)),
      });
    } catch {
      dispatch({ type: 'hydrate', lines: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state.lines));
    } catch {
      /* storage blocked — cart simply stays session-only */
    }
  }, [state.lines, state.hydrated]);

  const lines = useMemo(
    () =>
      state.lines
        .map((l) => {
          const product = products.find((p) => p.slug === l.slug);
          return product ? { ...l, product } : null;
        })
        .filter((l): l is CartLine => l !== null),
    [state.lines],
  );

  const subtotal = useMemo(() => {
    if (lines.some((l) => l.product.price === null)) return null;
    return lines.reduce((sum, l) => sum + (l.product.price ?? 0) * l.qty, 0);
  }, [lines]);

  /* A total is only as confirmed as the least confirmed price in it. */
  const subtotalIsEstimate = useMemo(
    () => lines.some((l) => l.product.estimates.includes('price')),
    [lines],
  );

  const add = useCallback((slug: string, qty = 1) => {
    dispatch({ type: 'add', slug, qty });
    setOpen(true);
  }, []);

  const api: CartApi = {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotal,
    subtotalIsEstimate,
    hydrated: state.hydrated,
    isOpen,
    add,
    setQty: useCallback((slug, qty) => dispatch({ type: 'setQty', slug, qty }), []),
    remove: useCallback((slug) => dispatch({ type: 'remove', slug }), []),
    clear: useCallback(() => dispatch({ type: 'clear' }), []),
    open: useCallback(() => setOpen(true), []),
    close: useCallback(() => setOpen(false), []),
  };

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
