/// Service Terms page.
/// [author] Kevin Zhang
/// [time] 2019-3-29

import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';

class ServiceTerms extends StatelessWidget {

  static String tag = "ServiceTerms";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text(WalletLocalizations.of(context).serviceTermsPageAppBarTitle),
          elevation: 0,
        ),

        body: SafeArea(
          child: Center(
            child: Text('Coming Soon ...'),
          ),
          // child: Container(
          //   padding: EdgeInsets.symmetric(horizontal: 30.0, vertical: 30.0),
          //   // child: _childColumn(context),
          // ),
        )
    );
  }
}