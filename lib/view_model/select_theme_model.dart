/// Model for Select Theme.
/// [author] Kevin Zhang
/// [time] 2019-5-7

import 'package:scoped_model/scoped_model.dart';
import 'package:wallet_app/model/global_model.dart';

class SelectThemeModel extends Model {
  String _selectedTheme = '';
  get getTheme => _selectedTheme;

  ///
  void setTheme(String setTheme) {
    _selectedTheme = setTheme;
    GlobalInfo.colorTheme = setTheme;
    notifyListeners();
  }
}