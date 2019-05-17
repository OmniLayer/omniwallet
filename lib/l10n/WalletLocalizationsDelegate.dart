import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';

class WalletLocalizationsDelegate extends LocalizationsDelegate<WalletLocalizations>{

  const WalletLocalizationsDelegate();
  static WalletLocalizationsDelegate delegate = const WalletLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    //支持的语言种类
    return ['en','zh'].contains(locale.languageCode);
  }

  @override
  Future<WalletLocalizations> load(Locale locale) {

     return new SynchronousFuture<WalletLocalizations>(new WalletLocalizations(locale));
  }

  @override
  bool shouldReload(LocalizationsDelegate<WalletLocalizations> old) {
    return false;
  }


}

