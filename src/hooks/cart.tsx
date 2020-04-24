import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

export interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@GoMarketplace:products');

      if (data) {
        setProducts(JSON.parse(data));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex >= 0) {
        // Retiro o produto que será alterado, retornando um novo array sem ele
        const filterProducts = products.filter(product => product.id !== id);
        // Busco o produto que terá a quantidade alterada
        const newProduct = products.find(product => product.id === id);
        // Seto o estado com o array novo e o produto com a nova quantidade
        if (newProduct) {
          newProduct.quantity += 1;

          setProducts([...filterProducts, newProduct]);

          await AsyncStorage.setItem(
            '@GoMarketplace:products',
            JSON.stringify([...filterProducts, newProduct]),
          );
        }
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex >= 0) {
        // Retiro o produto que será alterado retornando um novo array sem ele
        const filterProducts = products.filter(product => product.id !== id);
        // Busco o produto que terá a quantidade alterada
        const newProduct = products.find(product => product.id === id);
        // Seto o estado com o array novo e o produto novo
        if (newProduct) {
          // Se houver apenas uma unidade do produto, retiro do carrinho
          if (newProduct.quantity <= 1) {
            setProducts(filterProducts);

            await AsyncStorage.setItem(
              '@GoMarketplace:products',
              JSON.stringify(filterProducts),
            );
          } else {
            newProduct.quantity -= 1;

            setProducts([...filterProducts, newProduct]);

            await AsyncStorage.setItem(
              '@GoMarketplace:products',
              JSON.stringify([...filterProducts, newProduct]),
            );
          }
        }
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(p => p.id === product.id);

      if (productIndex < 0) {
        setProducts(oldState => [...oldState, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      } else {
        increment(product.id);
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
