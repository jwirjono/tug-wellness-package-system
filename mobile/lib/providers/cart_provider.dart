import 'package:flutter/material.dart';
import '../models/cart_item.dart';
import '../models/wellness_package.dart';

class CartProvider extends ChangeNotifier {
  final Map<String, CartItem> _items = {};

  Map<String, CartItem> get items => _items;

  int get totalCount => _items.values.fold(0, (sum, item) => sum + item.quantity);

  double get totalPrice => _items.values.fold(0.0, (sum, item) => sum + item.subtotal);

  bool inCart(String packageId) => _items.containsKey(packageId);

  int quantityOf(String packageId) => _items[packageId]?.quantity ?? 0;

  void addToCart(WellnessPackage package) {
    if (_items.containsKey(package.id)) {
      _items[package.id]!.quantity++;
    } else {
      _items[package.id] = CartItem(package: package);
    }
    notifyListeners();
  }

  void increment(String packageId) {
    if (_items.containsKey(packageId)) {
      _items[packageId]!.quantity++;
      notifyListeners();
    }
  }

  void decrement(String packageId) {
    if (!_items.containsKey(packageId)) return;
    if (_items[packageId]!.quantity <= 1) {
      _items.remove(packageId);
    } else {
      _items[packageId]!.quantity--;
    }
    notifyListeners();
  }

  void remove(String packageId) {
    _items.remove(packageId);
    notifyListeners();
  }
}