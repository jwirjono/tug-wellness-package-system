import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final items = cart.items.values.toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Cart'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: items.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('Your cart is empty', style: TextStyle(color: Colors.grey, fontSize: 16)),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.package.name,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                    const SizedBox(height: 4),
                                    Text(
                                      '\$${item.package.price.toStringAsFixed(2)} each',
                                      style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                                    ),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    onPressed: () => context.read<CartProvider>().decrement(item.package.id),
                                    icon: const Icon(Icons.remove_circle_outline),
                                    color: Colors.blue,
                                  ),
                                  Text('${item.quantity}',
                                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                  IconButton(
                                    onPressed: () => context.read<CartProvider>().increment(item.package.id),
                                    icon: const Icon(Icons.add_circle_outline),
                                    color: Colors.blue,
                                  ),
                                ],
                              ),
                              SizedBox(
                                width: 70,
                                child: Text(
                                  '\$${item.subtotal.toStringAsFixed(2)}',
                                  textAlign: TextAlign.right,
                                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Total + checkout bar
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [BoxShadow(color: Colors.grey.shade200, blurRadius: 8, offset: const Offset(0, -2))],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${cart.totalCount} item(s)', style: TextStyle(color: Colors.grey.shade600)),
                          Text(
                            'Total: \$${cart.totalPrice.toStringAsFixed(2)}',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Checkout coming soon!')),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                        ),
                        child: const Text('Checkout'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}