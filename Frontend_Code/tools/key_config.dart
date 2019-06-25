import 'Tools.dart';

/// Key Config page.
/// [author] Kevin Zhang
/// [time] 2019-4-19

class KeyConfig {
  static final String user_mnemonic = Tools.convertMD5Str('user.mnemonic');
  static final String user_mnemonicSeed = Tools.convertMD5Str('user.mnemonicSeed');
  static final String user_mnemonic_md5 = Tools.convertMD5Str('user.mnemonic_md5');
  static final String user_login_token = Tools.convertMD5Str('user.login_token');
  static final String user_pinCode_md5 = Tools.convertMD5Str('user.pinCode_md5');
  static final String is_backup = Tools.convertMD5Str('is_backup');
  static final String backParentId = Tools.convertMD5Str('backParentId');
  static final String set_language = Tools.convertMD5Str('set_language');
  static final String set_currency_unit = Tools.convertMD5Str('set_currency_unit');
  static final String set_theme = Tools.convertMD5Str('set_theme');
  static const String languageEn = 'English';
  static const String languageCn = '简体中文';
  static const String cny = 'CNY';
  static const String usd = 'USD';
  static const String light = 'Light';
  static const String dark = 'Dark';
}