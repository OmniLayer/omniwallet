/// Switch language display of app page.
/// [author] Kevin Zhang
/// [time] 2019-3-5

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/main.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view_model/main_model.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class SelectLanguage extends StatefulWidget {
  static String tag = "SelectLanguage";
  @override
  _SelectLanguageState createState() => _SelectLanguageState();
}

class _SelectLanguageState extends State<SelectLanguage> {
  
  String strClickItem = '';
  
  @override
  Widget build(BuildContext context) {
    //
    final model = MainStateModel().of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).languagePageAppBarTitle),
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
          children: _languageList(model),
        ),
      )
    );
  }

  // 
  void _actionSaveButton(MainStateModel model, BuildContext context) {
    print('strClickItem = $strClickItem');
    if (strClickItem != '') {
      model.setSelectedLanguage(strClickItem);
    
      // change app language.
      Locale locale;
      if (strClickItem == KeyConfig.languageEn) {
        locale = Locale('en',"US");
      } else {
        locale = Locale('zh',"CH");
      }
    
      MyApp.setLocale(context, locale);
    
      // save selected value to local storage
      _saveSelectedLanguage(strClickItem);
    }
                 
    Navigator.pop(context);
  }

  /// Build list data.
  /// [item] is list tile content.
  /// [setLanguage] is currently selected language.
  Widget _oneItem(BuildContext context, String item, String setLanguage) {

    bool isSelected;
    if (item == setLanguage) {
      isSelected = true;
    } else {
      isSelected = false;
    }

    return Ink(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
        leading: _iconLanguage(item),
        title: Text(
          item,
          // style: TextStyle(
          //   fontSize: 14,
          // ),
        ),
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

  // Build language list
  List<Widget> _languageList(MainStateModel model) {
    
    String setLanguage = model.getSelectedLanguage;
    
    // List content.
    List<Widget> _list = List();
    List<String> items = <String> [
      KeyConfig.languageEn, KeyConfig.languageCn,
    ];

    if (strClickItem != '') {
      setLanguage = strClickItem;
    }

    // _list.clear();
    for (int i = 0; i < items.length; i++) {
      _list.add(_oneItem(context, items[i], setLanguage));
      _list.add(Divider(height: 0, indent: 15));
    }

    return _list;
  }

  //
  void _saveSelectedLanguage(String value) async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString(KeyConfig.set_language, value);
  }

  //
  Widget _iconLanguage(String item) {
    if (item == 'English') {
      return Image.asset(Tools.imagePath('icon_english'), width: 24, height: 24);
    } else {
      return Image.asset(Tools.imagePath('icon_chinese'), width: 24, height: 24);
    }
  }
}