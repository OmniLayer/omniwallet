import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/view/main_view/main_page.dart';
import 'package:wallet_app/view/welcome/welcome_page_2.dart';

class WelcomePageOne extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 30.0, vertical: 30.0),
          child: _childColumn(context),
        ),
      )
    );
  }

  // Child content.
  Widget _childColumn(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: <Widget>[
        // Title
        Text(
          WalletLocalizations.of(context).welcomePageOneTitle,
          style: TextStyle(
            fontSize: 20.0,
            fontWeight: FontWeight.bold,
          ),
        ),

        // Image for welcome.
        Image.asset('assets/LunarX_Logo.jpg'),

        // Introduction content.
        Text(
          WalletLocalizations.of(context).welcomePageOneContent,
          textAlign: TextAlign.left,
          style: TextStyle(color: Colors.grey[700]),
        ),

        // Next button.
        RaisedButton(
          child: Text(WalletLocalizations.of(context).welcomePageOneButton),
          color: Colors.blue,
          textColor: Colors.white,
          onPressed: () {
            // Show the welcome page two.
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => WelcomePageTwo()
              )
            );
          },
        ),
        FlatButton(
          child: Text(WalletLocalizations.of(context).common_btn_skip),
          textColor: Colors.grey,
          onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (BuildContext context) => MainPage()));
          },
        ),
      ],
    );
  }
}
