class WellnessPackage {
  final String id;
  final String name;
  final String description;
  final double price;
  final int durationMinutes;
  final String status;
  final String category;

  WellnessPackage({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.durationMinutes,
    required this.status,
    required this.category,
  });

  factory WellnessPackage.fromJson(Map<String, dynamic> json) {
    return WellnessPackage(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: double.parse(json['price'].toString()),
      durationMinutes: json['duration_minutes'],
      status: json['status'],
      category: json['category'],
    );
  }
}