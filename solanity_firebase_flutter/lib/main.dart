import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:solanity_firebase_flutter/applock_wrapper.dart';
import 'package:solanity_firebase_flutter/services/local_storage.service.dart';
import 'firebase_options.dart';

void main() async{
   WidgetsFlutterBinding.ensureInitialized(); // required before any async setup
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await LocalStorageService.init(); // opens the Hive boxes
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        brightness: Brightness.light
      ),
      home: AppLockWrapper(child: Text('hii')),
    );
  }
}
