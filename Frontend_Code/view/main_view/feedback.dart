import 'dart:async';

/// Submit Feedback page.
/// [author] Kevin Zhang
/// [time] 2019-3-25

// import 'dart:async';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:keyboard_actions/keyboard_actions.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/model/global_model.dart';
import 'package:wallet_app/tools/app_data_setting.dart';
import 'package:wallet_app/view_model/state_lib.dart';
import 'package:path_provider/path_provider.dart' as path_provider;

class SubmitFeedback extends StatefulWidget {
  static String tag = "SubmitFeedback";

  @override
  _SubmitFeedbackState createState() => _SubmitFeedbackState();
}

class FeedBackInfo{
  String title;
  String content;
  String urls='';
  String email;
}

class _SubmitFeedbackState extends State<SubmitFeedback> {

  //
  FocusNode _nodeText1 = FocusNode();
  FocusNode _nodeText2 = FocusNode();
  FocusNode _nodeText3 = FocusNode();

  GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  FeedBackInfo _feedBackInfo;
  List<Widget> images ;
  List<String> imageUrls ;


  @override
  void initState() {
    super.initState();
//    GlobalInfo.isLocked = false;
//    GlobalInfo.isNeedLock =  false;
    submitFinish =false;
    _feedBackInfo = FeedBackInfo();
    _feedBackInfo.urls='';
    images = [];
    imageUrls = [];
  }

  @override
  void dispose() {
    GlobalInfo.isNeedLock =  true;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text(WalletLocalizations.of(context).feedbackPageTitle),
      ),

      body: FormKeyboardActions(
        actions: _keyboardActions(),
        child: SafeArea(
          child: _content(),
        ),
      ),
    );
  }

  // Keyboard Actions
  List<KeyboardAction> _keyboardActions() {

    List<KeyboardAction> actions = <KeyboardAction> [
      KeyboardAction(
          focusNode: _nodeText1,
          closeWidget: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Icon(Icons.close),
          )
      ),

      KeyboardAction(
          focusNode: _nodeText2,
          closeWidget: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Icon(Icons.close),
          )
      ),

      KeyboardAction(
          focusNode: _nodeText3,
          closeWidget: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Icon(Icons.close),
          )
      ),
    ];

    return actions;
  }

  List<Widget> buildImageWidget(){
    var width = 80.0;
    images.clear();
    if(imageUrls.length<9){
      images.add(
          GestureDetector(
            child: Image.asset('assets/upload_picture.png',width: width,height: width,fit: BoxFit.fill,),
            onTap: (){
              _bottomSheet();
            },
          ));
    }

    if(imageUrls!=null&&imageUrls.length>0){
      for(int i=0;i<imageUrls.length;i++){
        String url = imageUrls[i];
        images.add(
          Container(
            width: width,
            height: width,
            child: Stack(children: <Widget>[
              Tools.networkImage(url, width: width, height: width),
              Align(
                alignment: Alignment(0.95, -0.95),
                child: GestureDetector(
                  child: Image.asset(Tools.imagePath('icon_close'),width: 20,height: 20,),
                  onTap: (){
                    imageUrls.remove(url);
                    setState(() {
                    });
                  },
                ),
              )
            ],
            ),
          )
        );
      }
    }
    return images;
  }

  //
  Widget _content() {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(vertical: 20),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            TextFormField( // title
              decoration: InputDecoration(
                labelText: WalletLocalizations.of(context).feedbackPageInputTitleTooltip,
                labelStyle: TextStyle(
                  // color: Colors.blue,
                ),
                border: InputBorder.none,
                fillColor: AppCustomColor.themeBackgroudColor,
                filled: true,
              ),
              validator: (val){
                if(val.isEmpty){
                  return WalletLocalizations.of(context).common_tips_input+WalletLocalizations.of(context).feedbackPageInputTitleTooltip;
                }
              },
              onSaved: (val){
                _feedBackInfo.title = val;
              },
              focusNode: _nodeText1,
            ),

            SizedBox(height: 20),

            TextFormField( // content
              decoration: InputDecoration(
                labelText: WalletLocalizations.of(context).feedbackPageContentTooltip,
                labelStyle: TextStyle(
                  // color: Colors.blue,
                ),
                border: InputBorder.none,
                fillColor: AppCustomColor.themeBackgroudColor,
                filled: true,
              ),
              validator: (val){
                if(val.isEmpty){
                  return WalletLocalizations.of(context).common_tips_input+WalletLocalizations.of(context).feedbackPageContentTooltip;
                }
              },
              onSaved: (val){
                _feedBackInfo.content = val;
              },
              maxLines: null,
              focusNode: _nodeText2,
            ),

            // Upload Picture Title
            Container(
              padding: EdgeInsets.all(20),
              child: Text(
                WalletLocalizations.of(context).feedbackPageUploadPicTitle,
              ),
            ),

            Container(  // Upload Picture Button
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Wrap(
                spacing: 16,
                runSpacing: 20,
                children: this.buildImageWidget(),
              ),
            ),

            SizedBox(height: 20),

            TextFormField( // Email
              decoration: InputDecoration(
                labelText: WalletLocalizations.of(context).feedbackPageEmailTooltip,
                labelStyle: TextStyle(
                  // color: Colors.blue,
                ),
                border: InputBorder.none,
                fillColor: AppCustomColor.themeBackgroudColor,
                filled: true,
              ),
              validator: (val){
                if(val.isEmpty){
                  return WalletLocalizations.of(context).common_tips_input+WalletLocalizations.of(context).feedbackPageEmailTooltip;
                }
              },
              onSaved: (val){
                _feedBackInfo.email = val;
              },
              focusNode: _nodeText3,
              keyboardType: TextInputType.emailAddress,
            ),

            Container(  // submit button
              padding: EdgeInsets.symmetric(vertical: 80, horizontal: 30),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: RaisedButton(
                      child: Text(
                        WalletLocalizations.of(context).feedbackPageSubmitButton,
                        style: TextStyle(color: Colors.white),
                      ),

                      color: AppCustomColor.btnConfirm,
                      padding: EdgeInsets.symmetric(vertical: 15),
                      onPressed: submitFinish==false? postDataToServer:null,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  //

  bool submitFinish =false;
  Function postDataToServer(){
    final form = _formKey.currentState;
    if(form.validate()){
      form.save();
      if(_feedBackInfo.urls==null){
        _feedBackInfo.urls = '';
      }
      if(imageUrls!=null&&imageUrls.length>0){
        _feedBackInfo.urls = imageUrls.join(',');
      }

      Future future = NetConfig.post(context, NetConfig.feedback, {
          'title':_feedBackInfo.title,
          'content':_feedBackInfo.content,
          'imageUrls':_feedBackInfo.urls,
          'email':_feedBackInfo.email,
        });
      future.then((data){
        if(data!=null){
          Tools.showToast(WalletLocalizations.of(context).common_tips_finish);
          submitFinish = true;
          setState(() {
            
          });
        }
      });
    }
  }
  void _bottomSheet() {
    showModalBottomSheet(
        context: context,
        builder: (BuildContext context) {

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              ListTile(
                leading: Icon(Icons.photo_album),
                title: Text(WalletLocalizations.of(context).imagePickerBottomSheet_1),
                onTap: () {
                  _getImage(ImageSource.gallery);
                },
              ),

              ListTile(
                leading: Icon(Icons.photo_camera),
                title: Text(WalletLocalizations.of(context).imagePickerBottomSheet_2),
                onTap: () {
                  _getImage(ImageSource.camera);
                },
              ),
            ],
          );
        }
    );
  }

  //
  _getImage(ImageSource myImageSource) async {
    GlobalInfo.isLocked = false;
    GlobalInfo.isNeedLock =  false;
    var image = await ImagePicker.pickImage(source: myImageSource);

    // compress image
    var dir = await path_provider.getTemporaryDirectory();
    var targetPath = dir.absolute.path + "/temp.png";

    Future response = Tools.compressImage(image, targetPath,minWidth: 300,minHeight: 300);
    response.then((imgCompressed) {
      NetConfig.uploadImageFunc(
          imgCompressed,
          callback: (data) {
            if (data != null) {
              this.imageUrls.add(data);
              setState(() {});
            }
          }
      );
    });
    Navigator.pop(context);
  }
}