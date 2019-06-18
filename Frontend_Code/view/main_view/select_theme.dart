/// Switch theme.
/// [author] Kevin Zhang
/// [time] 2019-5-7

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/main.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view_model/main_model.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class SelectTheme extends StatefulWidget {
  static String tag = "SelectTheme";
  @override
  _SelectThemeState createState() => _SelectThemeState();
}

class _SelectThemeState extends State<SelectTheme> {
  
  String strClickItem = '';
  
  @override
  Widget build(BuildContext context) {
    //
    final model = MainStateModel().of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).themePageAppBarTitle),
        actions: <Widget>[
          FlatButton(  // save button
            child: Text(WalletLocalizations.of(context).languagePageSaveButton),
            textColor: Colors.blue,
            onPressed: () {
              _actionSaveButton(model, context);
            },
          ),
        ],
      ),

      body: SafeArea(
        child: ListView(
          children: _themeList(model),
        ),
      )
    );
  }

  // 
  void _actionSaveButton(MainStateModel model, BuildContext context) {
    print('strClickItem = $strClickItem');
    if (strClickItem != '') {
      model.setTheme(strClickItem);
    
      // change theme.
      if (strClickItem == KeyConfig.light) {
        MyApp.setThemeColor(context, Brightness.light);
      } else {
        MyApp.setThemeColor(context, Brightness.dark);
      }
      // save selected value to local storage
      _saveTheme(strClickItem);
    }
                 
    Navigator.pop(context);
  }

  /// Build list data.
  /// [item] is list tile content.
  /// [setTheme] is currently selected theme.
  Widget _oneItem(BuildContext context, String item, String setTheme) {

    bool isSelected;
    if (item == setTheme) {
      isSelected = true;
    } else {
      isSelected = false;
    }

    return Ink(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
        // leading: _iconLanguage(item),
        title: Text(item),
        trailing: Icon(
          isSelected ? Icons.check : null,
          color: Colors.blue,
        ),
        onTap: () { 
          setState(() {
            strClickItem = item;
          });
        },
      ),
    );
  }

  // Build theme list
  List<Widget> _themeList(MainStateModel model) {
    
    String setTheme = model.getTheme;
    
    // List content.
    List<Widget> _list = List();
    List<String> items = <String> [
      KeyConfig.light, KeyConfig.dark,
    ];

    if (strClickItem != '') {
      setTheme = strClickItem;
    }

    for (int i = 0; i < items.length; i++) {
      _list.add(_oneItem(context, items[i], setTheme));
      _list.add(Divider(height: 0, indent: 15));
    }

    return _list;
  }

  //
  void _saveTheme(String value) async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString(KeyConfig.set_theme, value);
  }

  //
  // Widget _iconLanguage(String item) {
  //   if (item == 'English') {
  //     return Image.asset(Tools.imagePath('icon_english'), width: 24, height: 24);
  //   } else {
  //     return Image.asset(Tools.imagePath('icon_chinese'), width: 24, height: 24);
  //   }
  // }
}