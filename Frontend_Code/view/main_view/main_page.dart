import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/main_view/home/home_page.dart';
import 'package:wallet_app/view/main_view/market/market_page.dart';
import 'package:wallet_app/view/main_view/my_page.dart';
import 'package:wallet_app/view/main_view/omni_page.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class MainPage extends StatefulWidget {
  static String tag = 'MainPage';
  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> with SingleTickerProviderStateMixin {

  Brightness brightness ;
  final _bottomNavigationActiveColor = Colors.black;
  List<Widget> pages = List();

  int _currentIndex = 0;

  @override void initState() {
    super.initState();

    pages
      ..add(HomePage())
      ..add(MarketPage())
      ..add(OmniPage())
      ..add(UserCenter());
  }

  @override void dispose() {
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    this.brightness = Theme.of(context).brightness;
    AppCustomColor.themeFrontColor =this.brightness==Brightness.dark?Colors.white:Colors.black;
    AppCustomColor.themeBackgroudColor =this.brightness==Brightness.dark?Colors.black:Colors.white;

    var navList = [
          BottomNavigationBarItem(
              icon: Image.asset(Tools.imagePath('nav_wallet_off'+(GlobalInfo.colorTheme==KeyConfig.light?'':'_deep')),width: 24,height: 24,),
              activeIcon: Image.asset(Tools.imagePath('nav_wallet_on'+(GlobalInfo.colorTheme==KeyConfig.light?'':'_deep')),width: 24,height: 24,),
              title: Text(
                WalletLocalizations.of(context).buttom_tab1_name,
              )),
          BottomNavigationBarItem(
              icon: Image.asset(Tools.imagePath('nav_market_off'+(GlobalInfo.colorTheme==KeyConfig.light?'':'_deep')),width: 24,height: 24,),
              activeIcon: Image.asset(Tools.imagePath('nav_market_on'+(GlobalInfo.colorTheme==KeyConfig.light?'':'_deep')),width: 24,height: 24,),
              title: Text(
                WalletLocalizations.of(context).buttom_tab2_name,
              )),
          BottomNavigationBarItem(
              icon: Image.asset(Tools.imagePath('nav_dex_off'+(GlobalInfo.colorTheme==KeyConfig.light?'':'_deep')),width: 24,height: 24,),
              activeIcon: Image.asset(Tools.imagePath('nav_dex_on'+(GlobalInfo.colorTheme==KeyConfig.light?'':'_deep')),width: 24,height: 24,),
              title: Text(
                WalletLocalizations.of(context).buttom_tab3_name,
              )),
          BottomNavigationBarItem(
              icon: Image.asset(Tools.imagePath('nav_my_off'+(GlobalInfo.colorTheme==KeyConfig.light?'':'_deep')),width: 24,height: 24,),
              activeIcon: Image.asset(Tools.imagePath('nav_my_on'+(GlobalInfo.colorTheme==KeyConfig.light?'':'_deep')),width: 24,height: 24,),
              title: Text(
                WalletLocalizations.of(context).buttom_tab4_name,
              )),
        ];
    return Scaffold(
      body: pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        items: navList,
        currentIndex: _currentIndex,
        backgroundColor: AppCustomColor.navBgColor,
        fixedColor: AppCustomColor.themeFrontColor,
        onTap: (int index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
