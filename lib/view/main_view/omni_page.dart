import 'package:flutter/material.dart';

class OmniPage extends StatefulWidget {
  @override
  _OmniPageState createState() => _OmniPageState();
}

class _OmniPageState extends State<OmniPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        leading: null,
        centerTitle: true,
//        title: Center(child: Text('omniDe')),
        title: Text('omniDe'),
      ),
    );
  }
}
