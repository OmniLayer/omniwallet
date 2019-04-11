import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/home/home_page.dart';
import 'package:wallet_app/view/main_view/market_page.dart';
import 'package:wallet_app/view/main_view/my_page.dart';
import 'package:wallet_app/view/main_view/omni_page.dart';

class MainPage extends StatefulWidget {
  static String tag = 'MainPage';
  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> with SingleTickerProviderStateMixin {

  TabController controller;
  Brightness brightness ;
  int _currentIndex = 0;
  final _bottomNavigationColor = Colors.grey;
  final _bottomNavigationActiveColor = Colors.blue;
  List<Widget> pages = List();

  @override void initState() {
    super.initState();

    pages..add(HomePage())
      ..add(MarketPage())
      ..add(OmniPage())
      ..add(UserCenter());
    controller = TabController(length: 4, vsync: this);
  }

  List<BottomNavigationBarItem>  bulidTabBars(){
    List<BottomNavigationBarItem> list = [];
    list.add(BottomNavigationBarItem(
        backgroundColor: Color(0xffEAEAEA),
        icon: Icon(
          Icons.home,
          color: _bottomNavigationColor,
        ),
        activeIcon: Icon(
          Icons.home,
          color: _bottomNavigationActiveColor,
        ),
        title: Text(
          '钱包',
          style: TextStyle(color: _bottomNavigationColor),
        )));
    list.add(BottomNavigationBarItem(
        backgroundColor: Color(0xffEAEAEA),
        icon: Icon(
          Icons.filter_drama,
          color: _bottomNavigationColor,
        ),
        activeIcon: Icon(
          Icons.filter_drama,
          color: _bottomNavigationActiveColor,
        ),
        title: Text(
          '市场',
          style: TextStyle(color: _bottomNavigationColor),
        )));
    list.add(BottomNavigationBarItem(
        backgroundColor: Color(0xffEAEAEA),
        icon: Icon(
          Icons.pages,
          color: _bottomNavigationColor,
        ),
        activeIcon: Icon(
          Icons.pages,
          color: _bottomNavigationActiveColor,
        ),
        title: Text(
          'OmniDe',
          style: TextStyle(color: _bottomNavigationColor),
        )));
    list.add(BottomNavigationBarItem(
        backgroundColor: Color(0xffEAEAEA),
        icon: Icon(
          Icons.my_location,
          color: _bottomNavigationColor,
        ),
        activeIcon: Icon(
          Icons.my_location,
          color: _bottomNavigationActiveColor,
        ),
        title: Text(
          '我的',
          style: TextStyle(color: _bottomNavigationColor),
        )));
    return list;
  }

  @override void dispose() {
    controller.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    this.brightness = Theme.of(context).brightness;
    AppCustomColor.themeFrontColor =this.brightness==Brightness.dark?Colors.white:Colors.black;
    AppCustomColor.themeBackgroudColor =this.brightness==Brightness.dark?Colors.black:Colors.white;
    return Scaffold(
      bottomNavigationBar: SafeArea(
        child: Container(
          height: 60,
          decoration: BoxDecoration(
            color: this.brightness==Brightness.dark?Colors.black:Colors.white,
            border: Border(top: BorderSide(
                color: Theme.of(context).dividerColor,
              width: 1
            ),
            )
          ),
          child: TabBar(
            indicatorWeight: 1,
            controller: controller,
            tabs:createTabs(),
          ),
        ),
      ),

      body: TabBarView(
        controller: controller,
        children: this.pages,
      ),
    );
  }

  createTabs(){
     List<Tab> tabs=[
      Tab(
        child: Column(
          children: <Widget>[
            Icon(Icons.home,color: AppCustomColor.themeFrontColor,),
            Text(WalletLocalizations.of(context).buttom_tab1_name ,style: TextStyle(color: AppCustomColor.themeFrontColor),),
          ],
        ),
      ),
      Tab(
        child: Column(
          children: <Widget>[
            Icon(Icons.filter_drama,color: AppCustomColor.themeFrontColor,),
            Text(WalletLocalizations.of(context).buttom_tab2_name,style: TextStyle(color: AppCustomColor.themeFrontColor),),
          ],
        ),
      ),
      Tab(
        child: Column(
          children: <Widget>[
            Icon(Icons.wb_sunny,color: AppCustomColor.themeFrontColor),
            Text(WalletLocalizations.of(context).buttom_tab3_name,style: TextStyle(color: AppCustomColor.themeFrontColor)),
          ],
        ),
      ),
      Tab(
        child: Column(
          children: <Widget>[
            Icon(Icons.my_location,color: AppCustomColor.themeFrontColor),
            Text(WalletLocalizations.of(context).buttom_tab4_name,style: TextStyle(color: AppCustomColor.themeFrontColor)),
          ],
        ),
      ),
    ];
    return tabs;
  }

}
