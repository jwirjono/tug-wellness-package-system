import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/wellness_package.dart';

class PackageService {
  // Use 10.0.2.2 for Android emulator (maps to host localhost)
  // Use localhost for iOS simulator or physical device on same network
  //static const String baseUrl = 'http://10.0.2.2:3000';
  static const String baseUrl = 'http://localhost:3000';

  Future<List<WellnessPackage>> getPackages() async {
    final response = await http.get(Uri.parse('$baseUrl/mobile/packages'));

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => WellnessPackage.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load packages');
    }
  }
}