/// Switch language display of app page.
/// [author] Kevin Zhang
/// [time] 2019-3-5

import 'package:flutter/material.dart';
import 'package:flutter_swiper/flutter_swiper.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view/welcome/create_account.dart';
import 'package:wallet_app/view/welcome/select_language.dart';
import 'package:wallet_app/view_model/main_model.dart';

class StartPage extends StatefulWidget {
  @override
  _StartPageState createState() => _StartPageState();
}

class _StartPageState extends State<StartPage> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(WalletLocalizations.of(context).startPageAppBarTitle),
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: <Widget>[
              _showSwiper(),  
              _showButtons(),
            ],
          ),
        ),
      )
    );
  }

  // Swiper
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

  // buttons
  Widget _showButtons() {
    return Column(
      // mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: <Widget>[
        SizedBox(height: 30),
        _getStartedButton(),
        _restoreWalletButton(),
        SizedBox(height: 50),
        _selectLanguage(),
      ],
    );
  }

  //  button
  Widget _getStartedButton() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 30, horizontal: 30),
      child: Row(
        children: <Widget>[
          Expanded(
            child: RaisedButton(
              child: Text(
                WalletLocalizations.of(context).startPageButtonFirst,
              ),

              color: AppCustomColor.btnConfirm,
              textColor: Colors.white,
              padding: EdgeInsets.symmetric(vertical: 15),
              elevation: 0,
              onPressed: () {
                Navigator.push(
                  context, 
                  MaterialPageRoute(
                    builder: (context) => CreateAccount()
                  ) 
                );
              },
            ),
          ),
        ],
      ),
    );
  } 
  
  //  button
  Widget _restoreWalletButton() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 10, horizontal: 30),
      child: Row(
        children: <Widget>[
          Expanded(
            child: RaisedButton(
              child: Text(
                WalletLocalizations.of(context).startPageButtonSecond,
              ),

              color: AppCustomColor.btnCancel,
              textColor: Colors.blue,
              padding: EdgeInsets.symmetric(vertical: 15),
              elevation: 0,
              onPressed: () {
                // TODO: restore wallet
              },
            ),
          ),
        ],
      ),
    );
  } 
  
  /*
  // Select language bar - OLD STYLE.
  Widget _selectLanguage(BuildContext context) {

    // Set value by model.
    final langModel = MainStateModel().of(context);

    return InkWell(
      // splashColor: Colors.blue[100],
      // highlightColor: Colors.blue[100],
      
      onTap: () {
        // Show the select language page.
        Navigator.push(
          context, 
          MaterialPageRoute(
            builder: (context) => SelectLanguage(),
          ), 
        );
      },
          
      child: Ink(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        color: AppCustomColor.themeBackgroudColor,
        
        child: Row(
          children: <Widget>[
            Icon(Icons.language),
            SizedBox(width: 15),
            Text(WalletLocalizations.of(context).startPageLanguageBarTitle),
            
            Expanded(
              child: Text(
                // Get value by model.
                langModel.getSelectedLanguage,
                // currentLanguage,
                textAlign: TextAlign.right,
                style: TextStyle(
                  color: Colors.grey,
                ),
              ),
            ),

            SizedBox(width: 15),

            Icon(
              Icons.keyboard_arrow_right, 
              color: Colors.grey,
            ),
          ],
        ),
      ),
    );
  }
  */

  //
  Widget _selectLanguage() {

    // Set value by model.
    final langModel = MainStateModel().of(context);

    return InkWell(
      onTap: () {
        // Show the select language page.
        Navigator.push(
          context, 
          MaterialPageRoute(
            builder: (context) => SelectLanguage(),
          ), 
        );
      },
          
      child: Ink(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        // color: AppCustomColor.themeBackgroudColor,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            // language icon
            Image.asset('assets/logo-png.png', width: 30, height: 30),

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
    );
  }
}