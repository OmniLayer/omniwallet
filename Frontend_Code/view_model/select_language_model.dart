/// Model for Select Language.
/// [author] Kevin Zhang
/// [time] 2019-3-10

import 'package:scoped_model/scoped_model.dart';
import 'package:wallet_app/model/global_model.dart';

class SelectLanguageModel extends Model {
  String _selectedLanguage = '';
  get getSelectedLanguage => _selectedLanguage;

  void setSelectedLanguage(String setLanguage) {
    _selectedLanguage = setLanguage;
    GlobalInfo.currLanguage = setLanguage;
    notifyListeners();
  }
}