import 'package:auto_size_text/auto_size_text.dart';
/// Market quotatio main page.
/// [author] Kevin Zhang
/// [time] 2019-3-13

import 'package:flutter/material.dart';
import 'package:wallet_app/l10n/WalletLocalizations.dart';

import 'market_detail.dart';

class MarketPage extends StatefulWidget {
  @override
  _MarketPageState createState() => _MarketPageState();
}

class _MarketPageState extends State<MarketPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: Text(WalletLocalizations.of(context).marketPageAppBarTitle),
      ),

      body: SafeArea(
        child: Center(
          child: Text('Coming Soon ...'),
        ),

        /*
        child: Column(
          children: <Widget>[
            _showExchange(),
            _showTitle(),
            _quotationList(),
          ], 
        ),
        */
      ),
    );
  }

  // Exchanges
  Widget _showExchange() {
    return Row(
      children: <Widget>[
        FlatButton(  // Favorites button
          child: Text(WalletLocalizations.of(context).marketPageFav),
          textColor: Colors.grey,
          onPressed: () {
            // TODO: Show favorite assets quotation.
          },
        ),

        FlatButton( // Binance exchange button
          child: Text('Binance'),
          textColor: Colors.grey,
          onPressed: () {
            // TODO: Show Binance exchange quotation.
          },
        ),
      ],
    );
  }

  // Quotation title.
  Widget _showTitle() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: <Widget>[
        FlatButton(  // All button
          child: Text(WalletLocalizations.of(context).marketPageAll),
          textColor: Colors.grey,
          onPressed: () {
            // TODO: select assets that want to show.
          },
        ),

        FlatButton( // Price button
          child: Text(WalletLocalizations.of(context).marketPagePrice),
          textColor: Colors.grey,
          onPressed: () {
            // TODO: Assets amount and value.
          },
        ),

        FlatButton( // Change button
          child: Text(WalletLocalizations.of(context).marketPageChange),
          textColor: Colors.grey,
          onPressed: () {
            // TODO: Quote change.
          },
        ),
      ],
    );
  }

  // 
  Widget _quotationList() {
    return Expanded(
      child: ListView.builder(
        itemCount: 10,
        itemBuilder: (context, index) {
          return _quotationItem();
        },
      ),
    );
  }

  // 
  Widget _quotationItem() {
    return InkWell(
      splashColor: Colors.blue[100],
      highlightColor: Colors.blue[100],

      onTap: () {
        // Show detail page.
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => MarketDetail(),
          ),
        );
      },

      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 15),
        decoration: BoxDecoration(
          border: Border(
              bottom: BorderSide(color: Theme.of(context).dividerColor)
          ),
        ),

        child: Row(
          children: <Widget>[
            Icon(Icons.attach_money),
            SizedBox(width: 20),

            Expanded(
              child: Column( // Trade pair and exchange
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: <Widget>[
                      Expanded(
                        child: AutoSizeText( // Trade pair first part
                          'LX',
                          style: TextStyle(
                            fontFamily: 'Arial',
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                          minFontSize: 10,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),

                      Expanded(
                        child: AutoSizeText( // Trade pair second part
                          '/USDT',
                          style: TextStyle(
                            fontFamily: 'Arial',
                            fontSize: 13,
                          ),
                          minFontSize: 10,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 10),

                  AutoSizeText( // exchange name
                    'Binance',
                    style: TextStyle(color: Colors.grey),
                    minFontSize: 10,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            SizedBox(width: 20),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  AutoSizeText( // Assets amount
                    '0.12345678',
                    style: TextStyle(
                      fontFamily: 'Tahoma',
                      fontSize: 16,
                    ),
                    minFontSize: 10,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 10),
                  AutoSizeText( // Assets value
                    '\$ 0.12',
                    style: TextStyle(color: Colors.grey),
                    minFontSize: 10,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            SizedBox(width: 30),

            Container( // Quote change
              padding: EdgeInsets.symmetric(horizontal: 5, vertical: 8),
              width: 70, height: 30,
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.all(Radius.circular(5)),
              ),

              child: AutoSizeText(
                '+8.12%',
                style: TextStyle(color: Colors.white),
                textAlign: TextAlign.center,
                minFontSize: 9,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
