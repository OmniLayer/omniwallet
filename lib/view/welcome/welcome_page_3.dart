import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/view/welcome/start.dart';

class WelcomePageThree extends StatelessWidget {

  // Assets
  final String img_1 = 'assets/LunarX_Logo.jpg';
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SafeArea(
          child: ListView(
            padding: EdgeInsets.symmetric(horizontal: 30, vertical: 60),
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
          WalletLocalizations.of(context).welcomePageThreeTitle,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 20.0,
            fontWeight: FontWeight.bold,
          ),
        ),

        // Introduction content.
        SizedBox(height: 40),
        Text(
          WalletLocalizations.of(context).welcomePageThreeContentOne,
          style: TextStyle(color: Colors.grey[700]),
        ),

        // List content.
        SizedBox(height: 40),
        _listContent(img_1, WalletLocalizations.of(context).welcomePageThreeContentTwo),

        SizedBox(height: 20),
        _listContent(img_1, WalletLocalizations.of(context).welcomePageThreeContentThree),

        SizedBox(height: 20),
        _listContent(img_1, WalletLocalizations.of(context).welcomePageThreeContentFour),

        SizedBox(height: 20),
        _listContent(img_1, WalletLocalizations.of(context).welcomePageThreeContentFive),

        SizedBox(height: 20),
        _listContent(img_1, WalletLocalizations.of(context).welcomePageThreeContentSix),

        SizedBox(height: 20),
        _listContent(img_1, WalletLocalizations.of(context).welcomePageThreeContentSeven),

        SizedBox(height: 40),
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
            style: TextStyle(color: Colors.grey[700]),
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
          child: Text(WalletLocalizations.of(context).welcomePageThreeButtonBack),
          onPressed: () { Navigator.pop(context); },
        ),

        // Next button.
        RaisedButton(
          child: Text(WalletLocalizations.of(context).welcomePageThreeButtonNext),
          color: Colors.blue,
          textColor: Colors.white,
          onPressed: () {
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (context) => StartPage()), 
              (route) => route == null
            );
          },
        ),
      ],
    );
  }
}