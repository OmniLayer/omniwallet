import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/view/main_view/home_page.dart';
import 'package:wallet_app/view/main_view/market_page.dart';
import 'package:wallet_app/view/main_view/my_page.dart';
import 'package:wallet_app/view/main_view/omni_page.dart';

class MainPage extends StatefulWidget {
  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> with SingleTickerProviderStateMixin {

  TabController controller;
  List<Tab> tabs=[
    Tab(text: '钱包',icon: Icon(Icons.home)),
    Tab(text: '市场',icon: Icon(Icons.filter_drama)),
    Tab(text: 'OmniDe',icon: Icon(Icons.wb_sunny)),
    Tab(text: '我的',icon: Icon(Icons.my_location)),
  ];

  List<Widget> pages=[
    new HomePage(),
    new MarketPage(),
    new OmniPage(),
    new UserCenter(),
  ];

  @override void initState() {
    super.initState();
    controller = TabController(length: 4, vsync: this);
  }

  @override void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: Material(
        color: Colors.blue,
        child: TabBar(
            indicatorWeight: 0.1,
            controller: controller,
            tabs:tabs),
      ),
      body: TabBarView(
          controller: controller,
          children: this.pages
      ),
    );
  }
}
