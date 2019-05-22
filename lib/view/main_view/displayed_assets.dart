/// Displayed Assets page.
/// [author] Kevin Zhang
/// [time] 2019-4-25

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';
import 'package:wallet_app/view_model/state_lib.dart';

class DisplayedAssets extends StatefulWidget {
  static String tag = "DisplayedAssets";

  /// Holds assets data of an address
  final WalletInfo address_data;

  // In the constructor, require a WalletInfo
  DisplayedAssets({Key key, @required this.address_data}) : super(key: key);

  @override
  _DisplayedAssetsState createState() => _DisplayedAssetsState();
}

class _DisplayedAssetsState extends State<DisplayedAssets> {

  List _assetList = List();
  List<AccountInfo> _assetData = List();

  @override
  void initState() {
    super.initState();
    _getPopularAsset();
  }

  /// 
  void _getPopularAsset() {

    Future data = NetConfig.get(context, NetConfig.getPopularAssetList);

    data.then((data) {
      if (NetConfig.checkData(data)) {
        _assetList = data;
        _assetData = widget.address_data.accountInfoes;

        print('==> PopularAsset amount = ${_assetList.length}');

        for (var index = 0; index < _assetData.length; index++) {
          for (var i = 0; i < _assetList.length; i++) {
            var node = _assetList[i];
            // print('==> assetName = ${node['assetName']}');
            if (_assetData[index].propertyId == node['assetId']) { // found
              if (_assetData[index].visible) { // 
                _assetList.removeAt(i);
                break;
              }
            }
          }
        }

        setState(() { });
      }
    });
  }

  @override
  Widget build(BuildContext context) {

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          title: Text(WalletLocalizations.of(context).displayedAssetsPageAppBarTitle),
        ),

        body: SafeArea(
          child: Column(
            children: <Widget>[
              _tabBar(),
              _tabBarView(),
            ],
          ),
        ),
      ),
    );
  }

  /// Two tabs
  Widget _tabBar() {
    return Padding(
      padding: const EdgeInsets.only(top: 20, bottom: 10),
      child: TabBar(
        labelColor: Colors.blue,
        labelPadding: EdgeInsets.only(bottom: 4),
        indicatorSize: TabBarIndicatorSize.label,
        unselectedLabelColor: Colors.grey,
        tabs: [
          Text(WalletLocalizations.of(context).displayedAssetsPageTitle_1),
          Text(WalletLocalizations.of(context).displayedAssetsPageTitle_2),
        ]
      ),
    );
  }

  /// Two tabBarView
  Widget _tabBarView() {
    return Expanded(
      child: TabBarView(
        children: <Widget>[
          _popularAsset(),
          Text(''),
        ],
      ),
    );
  }

  ///
  Widget _popularAsset() {
    return SingleChildScrollView(
      padding: EdgeInsets.only(top: 10),
      child: ListView(
        shrinkWrap: true,
        physics: NeverScrollableScrollPhysics(),
        children: _popularAssetList(),
      ),
    );
  }

  /// popular asset list
  List<Widget> _popularAssetList() {

    // list tile
    List<Widget> _list = List();

    for (int i = 0; i < _assetList.length; i++) {
      _list.add(_popularAssetItem(_assetList[i]));
      _list.add(Divider(height: 0, indent: 15));
    }

    return _list;
  }

  /// every popular asset
  Widget _popularAssetItem(var node) {
    print('==> node = ${node}');
    return Container(
      color: AppCustomColor.themeBackgroudColor,
      child: ListTile(
        // leading: Image.asset(_assetData.iconUrl),
        title: Text(node['assetName']),
        trailing: Icon(Icons.add),
        onTap: () {
          print('==> add asset = ${node['assetName']}');

          bool isFound = false;

          for (var i = 0; i < _assetData.length; i++) {
            if (_assetData[i].propertyId == node['assetId']) { // found
              _assetData[i].visible = true;
              isFound = true;
              break;
            }
          }

          Future response = NetConfig.post(context, NetConfig.addAsset, {
            'address': widget.address_data.address,
            'assetId': node['assetId'].toString(),
            'assetName': node['assetName'].toString(),
          });

          response.then((data) {
            if (NetConfig.checkData(data)) {
              if (!isFound) {
                AccountInfo info = AccountInfo();
                info.name = node['assetName'];
                info.propertyId = node['assetId'];
                info.amount = 0;
                info.visible = true;
                _assetData.add(info);
              }

              setState(() { });
            }
          });
        },
      ),
    );
  }

}