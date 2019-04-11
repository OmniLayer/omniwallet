import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';

import 'package:wallet_app/view/welcome/welcome_page_3.dart';

class WelcomePageTwo extends StatelessWidget {

  // Assets
  final String img_1 = 'assets/LunarX_Logo.jpg';
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(

      appBar: PreferredSize(
        child: AppBar(
          backgroundColor: Colors.transparent,
          // brightness: Theme.of(context).brightness == 
          //   Brightness.dark ? Brightness.light : Brightness.dark,
        ),
        preferredSize: Size.fromHeight(0),
      ),

      body: SafeArea(
        child: ListView(
          padding: EdgeInsets.symmetric(horizontal: 30, vertical: 30),
          children: <Widget>[
            _childColumn(context),
          ],
        ),
      )
    );
  }

  // Child content.
  Widget _childColumn(BuildContext context) {
    return Column(
      children: <Widget>[
        // Title
        Text(
          WalletLocalizations.of(context).welcomePageTwoTitle,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 20.0,
            fontWeight: FontWeight.bold,
          ),
        ),

        // Introduction content.
        SizedBox(height: 30),
        Text(
          WalletLocalizations.of(context).welcomePageTwoContentOne,
          // style: TextStyle(color: Colors.grey[700]),
        ),

        // List content.
        SizedBox(height: 30),
        _listContent(img_1, WalletLocalizations.of(context).welcomePageTwoContentTwo),

        SizedBox(height: 20),
        _listContent(img_1, WalletLocalizations.of(context).welcomePageTwoContentThree),

        SizedBox(height: 20),
        _listContent(img_1, WalletLocalizations.of(context).welcomePageTwoContentFour),

        SizedBox(height: 20),
        _listContent(img_1, WalletLocalizations.of(context).welcomePageTwoContentFive),

        SizedBox(height: 30),
        _bottomButton(context),
      ],
    );
  }

  //
  Widget _listContent(String img, String txt) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Image.asset(img, width: 50, height: 50),
        SizedBox(width: 30),
        Expanded(
          child: Text(
            txt,
            // style: TextStyle(color: Colors.grey[700]),
          ),
        ),
      ],
    );
  }

  // Buttons
  Widget _bottomButton(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: <Widget>[
        // Back button.
        RaisedButton(
          child: Text(WalletLocalizations.of(context).welcomePageTwoButtonBack),
          onPressed: () { Navigator.pop(context); },
        ),

        // Next button.
        RaisedButton(
          child: Text(WalletLocalizations.of(context).welcomePageTwoButtonNext),
          color: Colors.blue,
          textColor: Colors.white,
          onPressed: () {
            // Show the welcome page three.
            Navigator.push(context,
              MaterialPageRoute(builder: (context) => WelcomePageThree()));
          },
        ),
      ],
    );
  }
}