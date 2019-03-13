import 'package:scoped_model/scoped_model.dart';

class SelectLanguageModel extends Model {
  String _selectedLanguage = '';
  get getSelectedLanguage => _selectedLanguage;

  void setSelectedLanguage(String setLanguage) {
    _selectedLanguage = setLanguage;
    notifyListeners();
  }

  SelectLanguageModel of(context) => 
    ScopedModel.of<SelectLanguageModel>(context, rebuildOnChange: true);
}