/// Start page.
/// [author] Kevin Zhang
/// [time] 2019-3-5

import 'package:flutter/material.dart';
import 'package:flutter_swiper/flutter_swiper.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/Tools.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/backupwallet/restore_account_page.dart';
import 'package:wallet_app/view/welcome/create_account.dart';
import 'package:wallet_app/view/welcome/select_language.dart';
import 'package:wallet_app/view/widgets/custom_raise_button_widget.dart';
import 'package:wallet_app/view_model/main_model.dart';

class StartPage extends StatefulWidget {
  static String tag = "StartPage";
  @override
  _StartPageState createState() => _StartPageState();
}

class _StartPageState extends State<StartPage> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppCustomColor.themeBackgroudColor,
      
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).startPageAppBarTitle),
      ),

      body: SafeArea(
        child: Column(
          children: <Widget>[
            _showSwiper(),

            // two buttons area
            Expanded(child: Container()),
            _getStarted(),
            SizedBox(height: 30),
            _restoreWallet(),
            Expanded(child: Container()),

            _selectLanguage(),
          ],
        ),
      )
    );
  }

  /// Swiper
  Widget _showSwiper() {
    return Container(
      height: 230,
      child: Swiper(
        itemBuilder: (BuildContext context, int index) {
          // return Image.network("http://via.placeholder.com/350x150",fit: BoxFit.fill,);
          return Image.asset('assets/swiper-1.png', fit: BoxFit.fill,);
        },
        itemCount: 4,
        pagination: SwiperPagination(),
        control: SwiperControl(),
      ),
    );
  }

  /// Get Started button
  Widget _getStarted() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 30),
      child: CustomRaiseButton(
        context: context,
        hasRow: false,
        title: WalletLocalizations.of(context).startPageButtonFirst,
        titleColor: Colors.white,
        color: AppCustomColor.btnConfirm,
        callback: () {
          Navigator.of(context).pushNamed(CreateAccount.tag);
        },
      ),
    );
  }

  // Restore Wallet button
  Widget _restoreWallet() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 30),
      child: CustomRaiseButton(
        context: context,
        hasRow: false,
        title: WalletLocalizations.of(context).startPageButtonSecond,
        titleColor: Colors.blue,
        color: AppCustomColor.btnCancel,
        callback: () {
          Navigator.of(context).pushNamed(RestoreAccount.tag);
        },
      ),
    );
  }

  /// select language
  Widget _selectLanguage() {

    // Set value by model.
    final langModel = MainStateModel().of(context);

    return InkWell(
      child: Ink(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 15),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              _iconLanguage(langModel.getSelectedLanguage),
              SizedBox(width: 15),
              Text(
                // Get selected language by user before
                langModel.getSelectedLanguage,
                // style: TextStyle(
                //   color: Colors.grey,
                // ),
              ),
              SizedBox(width: 20),
              Icon(
                Icons.keyboard_arrow_right, 
                color: Colors.grey,
              ),
            ],
          ),
        ),
      ),

      onTap: () {
        // Show the select language page.
        Navigator.of(context).pushNamed(SelectLanguage.tag);
      },
    );
  }

  //
  Widget _iconLanguage(String strLang) {
    if (strLang == 'English') {
      return Image.asset(Tools.imagePath('icon_english'), width: 24, height: 24);
    } else {
      return Image.asset(Tools.imagePath('icon_chinese'), width: 24, height: 24);
    }
  }
}