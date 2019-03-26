import 'package:flutter/material.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';

class WebViewPage extends StatefulWidget {
  @override
  _WebViewPageState createState() => _WebViewPageState();
}
class _WebViewPageState extends State<WebViewPage> {
  @override
  Widget build(BuildContext context) {
    return WebviewScaffold(
      url: "http://www.omnilayer.org/",
      appBar: new AppBar(
        title: new Text("Omni Layer"),
      ),
    );
  }
}
