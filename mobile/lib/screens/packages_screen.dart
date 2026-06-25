import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/wellness_package.dart';
import '../providers/cart_provider.dart';
import '../services/package_service.dart';
import 'cart_screen.dart';

class PackagesScreen extends StatefulWidget {
  const PackagesScreen({super.key});

  @override
  State<PackagesScreen> createState() => _PackagesScreenState();
}

class _PackagesScreenState extends State<PackagesScreen> {
  late Future<List<WellnessPackage>> _packages;

  @override
  void initState() {
    super.initState();
    _packages = PackageService().getPackages();
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Wellness Packages'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart),
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CartScreen()),
                ),
              ),
              if (cart.totalCount > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${cart.totalCount}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: FutureBuilder<List<WellnessPackage>>(
        future: _packages,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final packages = snapshot.data!;

          if (packages.isEmpty) {
            return const Center(child: Text('No packages available.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: packages.length,
            itemBuilder: (context, index) => PackageCard(package: packages[index]),
          );
        },
      ),
    );
  }
}

class PackageCard extends StatelessWidget {
  final WellnessPackage package;
  const PackageCard({super.key, required this.package});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final inCart = cart.inCart(package.id);
    final quantity = cart.quantityOf(package.id);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    package.name,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    package.category,
                    style: TextStyle(fontSize: 12, color: Colors.blue.shade700, fontWeight: FontWeight.w500),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(package.description, style: TextStyle(color: Colors.grey.shade600, fontSize: 14)),
            const SizedBox(height: 12),
            Row(
              children: [
                Text(
                  '\$${package.price.toStringAsFixed(2)}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.green),
                ),
                const SizedBox(width: 12),
                Icon(Icons.timer, size: 16, color: Colors.grey.shade500),
                const SizedBox(width: 4),
                Text('${package.durationMinutes} min', style: TextStyle(color: Colors.grey.shade600)),
              ],
            ),
            const SizedBox(height: 12),

            // Buy controls
            inCart
                ? Row(
                    children: [
                      IconButton(
                        onPressed: () => context.read<CartProvider>().decrement(package.id),
                        icon: const Icon(Icons.remove_circle_outline),
                        color: Colors.blue,
                      ),
                      Text('$quantity', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      IconButton(
                        onPressed: () => context.read<CartProvider>().increment(package.id),
                        icon: const Icon(Icons.add_circle_outline),
                        color: Colors.blue,
                      ),
                      const Spacer(),
                      Text(
                        'Subtotal: \$${(package.price * quantity).toStringAsFixed(2)}',
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ],
                  )
                : SizedBox(
                    width: 150,
                    child: ElevatedButton(
                      onPressed: () => context.read<CartProvider>().addToCart(package),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.blue, foregroundColor: Colors.white),
                      child: const Text('Buy Item'),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}