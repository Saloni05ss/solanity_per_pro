import 'package:flutter/material.dart';
import 'package:solanity_firebase_flutter/services/security.service.dart';

class AppLockWrapper extends StatefulWidget {
  final Widget child; // your actual home screen

  const AppLockWrapper({super.key, required this.child});

  @override
  State<AppLockWrapper> createState() => _AppLockWrapperState();
}

class _AppLockWrapperState extends State<AppLockWrapper> with WidgetsBindingObserver {
  final SecurityService _security = SecurityService();
  bool _isLocked = false;
  bool _checkedOnStart = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkLockOnStart();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  Future<void> _checkLockOnStart() async {
    final enabled = await _security.isEnabled();
    if (enabled) {
      setState(() => _isLocked = true);
      _tryUnlock();
    }
    setState(() => _checkedOnStart = true);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    // Lock again whenever the app comes back from background
    if (state == AppLifecycleState.resumed && _checkedOnStart) {
      final enabled = await _security.isEnabled();
      if (enabled) {
        setState(() => _isLocked = true);
        _tryUnlock();
      }
    }
  }

  Future<void> _tryUnlock() async {
    final success = await _security.authenticate(
      reason: 'Unlock to continue using the app',
    );
    if (success) {
      setState(() => _isLocked = false);
    }
    // if it fails, _isLocked stays true — the lock screen keeps showing
    // with a retry button (below), we don't auto-close the app
  }

  @override
  Widget build(BuildContext context) {
    if (!_checkedOnStart) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_isLocked) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock, size: 64),
              const SizedBox(height: 16),
              const Text('App is locked'),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _tryUnlock,
                child: const Text('Unlock'),
              ),
            ],
          ),
        ),
      );
    }

    return widget.child;
  }
}