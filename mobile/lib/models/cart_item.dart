import 'wellness_package.dart';

class CartItem {
  final WellnessPackage package;
  int quantity;

  CartItem({required this.package, this.quantity = 1});

  double get subtotal => package.price * quantity;
}